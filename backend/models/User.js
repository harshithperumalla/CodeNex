const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "mentor", "user"],
      default: "user",
    },

    streak: {
      type: Number,
      default: 0,
    },

    points: {
      type: Number,
      default: 0,
    },

    rank: {
      type: Number,
      default: 0,
    },

    codingSolved: {
      type: Number,
      default: 0,
    },

    aptitudeCompleted: {
      type: Number,
      default: 0,
    },

    coursesWatched: {
      type: Number,
      default: 0,
    },

    typingTests: {
      type: Number,
      default: 0,
    },

    meetingsAttended: {
      type: Number,
      default: 0,
    },

    certificatesEarned: {
      type: Number,
      default: 0,
    },

    badgesEarned: {
      type: [String],
      default: [],
    },

    rankImprovements: {
      type: Number,
      default: 0,
    },

    college: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    yearOfStudy: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    hobbies: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    enrollments: [enrollmentSchema],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    completedAptitude: {
      type: [String],
      default: [],
    },

    completedDates: {
      type: [String],
      default: [],
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    validateModifiedOnly: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ assignedMentor: 1 });
userSchema.index({ points: -1, codingSolved: -1 });

// Pre-save hook to hash password and assign name
userSchema.pre("save", async function () {
  if (!this.name) {
    this.name = this.fullName;
  }
  
  if (!this.isModified("password")) {
    return;
  }

  if (!this.password) {
    return;
  }

  // Prevent double-hashing if the password is already a bcrypt hash
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$") || this.password.startsWith("$2y$")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

userSchema.methods.toPublicProfile = function () {
  return {
    userId: this._id.toString(),
    fullName: this.fullName,
    name: this.name || this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role === "user" ? "student" : this.role,
    streak: this.streak,
    points: this.points,
    joinDate: this.createdAt?.toISOString().split("T")[0] || "",
    avatar: this.avatar,
    profileImageUrl: this.profileImageUrl,
    rank: this.rank,
    codingSolved: this.codingSolved,
    aptitudeCompleted: this.aptitudeCompleted,
    coursesWatched: this.coursesWatched,
    typingTests: this.typingTests,
    meetingsAttended: this.meetingsAttended || 0,
    certificatesEarned: this.certificatesEarned || 0,
    badgesEarned: this.badgesEarned,
    completedDates: this.completedDates || [],
    rankImprovements: this.rankImprovements,
    college: this.college,
    degree: this.degree,
    yearOfStudy: this.yearOfStudy,
    skills: this.skills,
    interests: this.interests,
    hobbies: this.hobbies,
    location: this.location,
    about: this.about,
    github: this.github,
    linkedin: this.linkedin,
    portfolio: this.portfolio,
    assignedMentor: this.assignedMentor,
  };
};

module.exports = mongoose.model("User", userSchema);