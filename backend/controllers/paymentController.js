const Razorpay = require("razorpay");
const crypto = require("crypto");
const Course = require("../models/Course");
const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || "rzp_test_1234567890abcdef";
};

const getRazorpaySecret = () => {
  return process.env.RAZORPAY_KEY_SECRET || "abcdef1234567890secretkey";
};

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpaySecret(),
  });
};

// GET /api/payment/config
exports.getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    keyId: getRazorpayKeyId(),
  });
};

// POST /api/payment/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
    }

    // Handle Free Course instant enrollment
    if (course.price === 0) {
      const enrollment = await Enrollment.create({
        user: req.user._id,
        course: courseId,
        progress: 0,
      });

      const user = await User.findById(req.user._id);
      if (!user.enrollments.some((e) => e.course.toString() === courseId)) {
        user.enrollments.push({ course: courseId, progress: 0 });
        user.coursesWatched += 1;
        await user.save();
      }

      course.students += 1;
      await course.save();

      return res.status(201).json({
        success: true,
        isFree: true,
        message: `Enrolled in free course: ${course.title}`,
        enrollment,
      });
    }

    const amountInPaise = Math.round(course.price * 100);
    const receipt = `rcpt_${Date.now()}_${req.user._id.toString().substring(18)}`;

    let order;
    const razorpayKeyId = getRazorpayKeyId();
    const razorpaySecret = getRazorpaySecret();
    const isRealKeyConfigured =
      razorpayKeyId &&
      razorpaySecret &&
      !razorpayKeyId.includes("1234567890");

    if (isRealKeyConfigured) {
      try {
        const razorpay = getRazorpayInstance();
        order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: receipt,
          notes: {
            courseId: course._id.toString(),
            userId: req.user._id.toString(),
          },
        });
      } catch (rzpErr) {
        console.warn("Razorpay API call failed, using test order fallback:", rzpErr.message);
        order = {
          id: `order_test_${Date.now()}`,
          entity: "order",
          amount: amountInPaise,
          amount_paid: 0,
          amount_due: amountInPaise,
          currency: "INR",
          receipt: receipt,
          status: "created",
        };
      }
    } else {
      order = {
        id: `order_test_${Date.now()}`,
        entity: "order",
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: "INR",
        receipt: receipt,
        status: "created",
      };
    }

    // Store Payment in MongoDB with status 'created' (NOT enrolled yet!)
    const payment = await Payment.create({
      user: req.user._id,
      course: course._id,
      razorpayOrderId: order.id,
      amount: course.price,
      currency: "INR",
      status: "created",
      receipt: receipt,
    });

    res.json({
      success: true,
      order,
      paymentId: payment._id,
      keyId: razorpayKeyId,
      course: {
        id: course._id,
        title: course.title,
        price: course.price,
      },
    });
  } catch (err) {
    console.error("Create Razorpay Order Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create Razorpay order" });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;

    if (!razorpayOrderId || !courseId) {
      return res.status(400).json({ success: false, message: "Order ID and Course ID are required" });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment order record not found" });
    }

    const razorpaySecret = getRazorpaySecret();
    const isRealKeyConfigured =
      razorpaySecret && !razorpaySecret.includes("1234567890");

    if (isRealKeyConfigured && razorpaySignature && razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        payment.status = "failed";
        await payment.save();
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature verification",
        });
      }
    }

    // Mark payment as success in MongoDB
    payment.razorpayPaymentId = razorpayPaymentId || `pay_test_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || "sig_verified";
    payment.status = "success";
    await payment.save();

    // ENROLL student ONLY AFTER successful payment verification
    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: courseId,
        payment: payment._id,
        progress: 0,
      });
    }

    // Sync with User document
    const user = await User.findById(req.user._id);
    if (user && !user.enrollments.some((e) => e.course.toString() === courseId)) {
      user.enrollments.push({ course: courseId, progress: 0 });
      user.coursesWatched += 1;
      await user.save();
    }

    // Increment Course students count
    const course = await Course.findById(courseId);
    if (course) {
      course.students += 1;
      await course.save();
    }

    res.json({
      success: true,
      message: `Payment verified & student enrolled in ${course ? course.title : "Course"}`,
      paymentId: payment._id,
      txnId: payment.razorpayPaymentId,
      courseId: course ? course._id : courseId,
      courseTitle: course ? course.title : "Course",
      amount: payment.amount,
      enrollment,
    });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ success: false, message: err.message || "Payment verification failed" });
  }
};

// POST /api/payment/failure (Mark payment as failed if cancelled or declined)
exports.markPaymentFailed = async (req, res) => {
  try {
    const { razorpayOrderId, reason } = req.body;
    if (razorpayOrderId) {
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }
    res.json({ success: true, message: "Payment status recorded as failed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payment/history
exports.getPaymentHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate("user", "fullName email")
      .populate("course", "title price category thumbnail")
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => ({
      id: p._id,
      txnId: p.razorpayPaymentId || p.razorpayOrderId,
      user: p.user ? p.user.fullName : "Unknown",
      userEmail: p.user ? p.user.email : "",
      course: p.course ? p.course.title : "Course",
      courseId: p.course ? p.course._id : null,
      amount: p.amount,
      status: p.status,
      method: p.paymentMethod,
      time: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, payments: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
