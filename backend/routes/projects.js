const express = require("express")
const Project = require("../models/Project")
const User = require("../models/User")
const { auth, requireRole } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// Get all projects
router.get("/", auth, async (req, res) => {
  try {
    const { status, skills } = req.query
    const query = {}

    if (status) {
      query.status = status
    }

    if (skills) {
      const skillsArray = skills.split(",")
      query.requiredSkills = { $in: skillsArray }
    }

    const projects = await Project.find(query).populate("managerId", "name email")
    res.json(projects)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("managerId", "name email")
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create project (managers only)
router.post(
  "/",
  [
    auth,
    requireRole(["manager"]),
    body("name").notEmpty(),
    body("description").notEmpty(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("teamSize").isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, startDate, endDate, requiredSkills, teamSize, status } = req.body

      const project = new Project({
        name,
        description,
        startDate,
        endDate,
        requiredSkills: requiredSkills || [],
        teamSize,
        status: status || "planning",
        managerId: req.user._id,
      })

      await project.save()
      await project.populate("managerId", "name email")

      res.status(201).json(project)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update project
router.put("/:id", [auth, requireRole(["manager"])], async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "managerId",
      "name email",
    )

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    res.json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Find suitable engineers for a project
router.get("/:id/suitable-engineers", auth, requireRole(["manager"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const engineers = await User.find({
      role: "engineer",
      skills: { $in: project.requiredSkills },
    }).select("-password")

    res.json(engineers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
