const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["engineer", "manager"],
      required: true,
    },
    // Engineer-specific fields
    skills: [
      {
        type: String,
      },
    ],
    seniority: {
      type: String,
      enum: ["junior", "mid", "senior"],
      default: "junior",
    },
    maxCapacity: {
      type: Number,
      default: 100, // 100 for full-time, 50 for part-time
    },
    department: {
      type: String,
      default: "Engineering",
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
