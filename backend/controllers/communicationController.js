const Message = require("../models/Message");
const User = require("../models/User");

exports.getMessages = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const userId = req.user._id;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: "Partner ID is required" });
    }

    // Fetch messages between userId and partnerId
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(200);

    // Optionally mark messages sent by partner as read
    await Message.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: "Receiver ID and message content are required" });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      read: false
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChatPartners = async (req, res) => {
  try {
    const user = req.user;
    let partners = [];

    if (user.role === "mentor") {
      // Mentors get all students assigned to them
      partners = await User.find({ role: "user", assignedMentor: user._id })
        .select("fullName name email avatar");
    } else if (user.role === "user") {
      // Students get their assigned mentor (if any) and all mentors
      const assigned = user.assignedMentor ? await User.findById(user.assignedMentor).select("fullName name email avatar role") : null;
      const allMentors = await User.find({ role: "mentor" }).select("fullName name email avatar role");
      partners = allMentors;
    } else {
      // Admin gets everyone
      partners = await User.find({ _id: { $ne: user._id } }).select("fullName name email role avatar");
    }

    res.json({ success: true, partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
