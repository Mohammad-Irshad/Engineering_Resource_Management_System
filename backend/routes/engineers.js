const express = require("express")
const User = require("../models/User")
const Assignment = require("../models/Assignment")
const { auth, requireRole } = require("../middleware/auth")

const router = express.Router()

// Get all engineers
router.get("/", auth, async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" }).select("-password")
    res.json(engineers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get engineer capacity
router.get("/:id/capacity", auth, async (req, res) => {
  try {
    const engineer = await User.findById(req.params.id)
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" })
    }

    // Get active assignments
    const currentDate = new Date()
    const activeAssignments = await Assignment.find({
      engineerId: req.params.id,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).populate("projectId", "name")

    const totalAllocated = activeAssignments.reduce((sum, assignment) => sum + assignment.allocationPercentage, 0)

    const availableCapacity = engineer.maxCapacity - totalAllocated

    res.json({
      engineer: {
        id: engineer._id,
        name: engineer.name,
        maxCapacity: engineer.maxCapacity,
      },
      totalAllocated,
      availableCapacity,
      activeAssignments,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update engineer profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { skills, seniority, maxCapacity } = req.body

    // Engineers can only update their own profile, managers can update any engineer
    if (req.user.role === "engineer" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const engineer = await User.findByIdAndUpdate(
      req.params.id,
      { skills, seniority, maxCapacity },
      { new: true },
    ).select("-password")

    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found" })
    }

    res.json(engineer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
