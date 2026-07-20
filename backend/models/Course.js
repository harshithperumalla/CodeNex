const mongoose = require("mongoose");

const pdfResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    duration: { type: String, default: "10:00" },
    videoType: {
      type: String,
      enum: ["cloudinary", "youtube"],
      default: "youtube",
    },
    videoUrl: { type: String, default: "" },
    publicId: { type: String, default: "" },
    pdfs: [pdfResourceSchema],
    notes: { type: String, default: "" },
    isFreePreview: { type: Boolean, default: false },
    order: { type: Number, default: 1 },
  },
  { _id: true, timestamps: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 1 },
    lessons: [lessonSchema],
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, default: "" },
    courseType: {
      type: String,
      enum: ["FREE", "PAID"],
      default: "FREE",
    },
    price: { type: Number, default: 0, min: 0 },
    priceDisplay: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    students: { type: Number, default: 0 },
    tag: {
      type: String,
      enum: ["Popular", "New", "Enrolled", "Trending", "Best Seller", "Draft"],
      default: "New",
    },
    category: { type: String, default: "Programming" },
    thumbnail: { type: String, default: "" },
    duration: { type: String, default: "" },
    lessons: { type: Number, default: 0 },
    modules: [moduleSchema],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
