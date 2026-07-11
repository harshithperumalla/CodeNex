const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
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
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
