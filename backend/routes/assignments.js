const express = require("express")
const Assignment = require("../models/Assignment")
const User = require("../models/User")
const { auth, requireRole } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// Get all assignments
router.get("/", auth, async (req, res) => {
  try {
    const { engineerId, projectId } = req.query
    const query = {}

    if (engineerId) {
      query.engineerId = engineerId
    }

    if (projectId) {
      query.projectId = projectId
    }

    // If user is an engineer, only show their assignments
    if (req.user.role === "engineer") {
      query.engineerId = req.user._id
    }

    const assignments = await Assignment.find(query)
      .populate("engineerId", "name email skills")
      .populate("projectId", "name description status")

    res.json(assignments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create assignment (managers only)
router.post(
  "/",
  [
    auth,
    requireRole(["manager"]),
    body("engineerId").notEmpty(),
    body("projectId").notEmpty(),
    body("allocationPercentage").isInt({ min: 1, max: 100 }),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body

      // Check if engineer exists
      const engineer = await User.findById(engineerId)
      if (!engineer || engineer.role !== "engineer") {
        return res.status(404).json({ message: "Engineer not found" })
      }

      // Check capacity
      const currentAssignments = await Assignment.find({
        engineerId,
        $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
      })

      const totalAllocated = currentAssignments.reduce((sum, assignment) => sum + assignment.allocationPercentage, 0)

      if (totalAllocated + allocationPercentage > engineer.maxCapacity) {
        return res.status(400).json({
          message: "Assignment would exceed engineer capacity",
          availableCapacity: engineer.maxCapacity - totalAllocated,
        })
      }

      const assignment = new Assignment({
        engineerId,
        projectId,
        allocationPercentage,
        startDate,
        endDate,
        role: role || "Developer",
      })

      await assignment.save()
      await assignment.populate("engineerId", "name email skills")
      await assignment.populate("projectId", "name description status")

      res.status(201).json(assignment)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update assignment
router.put("/:id", [auth, requireRole(["manager"])], async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("engineerId", "name email skills")
      .populate("projectId", "name description status")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json(assignment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete assignment
router.delete("/:id", auth, requireRole(["manager"]), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }
    res.json({ message: "Assignment deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
