const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Assignment = require("../models/Assignment");
require("dotenv").config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Assignment.deleteMany({});

    // Create users
    const manager = new User({
      email: "manager@company.com",
      password: "password123",
      name: "Rajesh Sharma",
      role: "manager",
    });
    await manager.save();

    const engineers = [
      {
        email: "anita@company.com",
        password: "password123",
        name: "Anita Singh",
        role: "engineer",
        skills: ["React", "Node.js", "TypeScript"],
        seniority: "senior",
        maxCapacity: 100,
      },
      {
        email: "vikram@company.com",
        password: "password123",
        name: "Vikram Patel",
        role: "engineer",
        skills: ["Python", "Django", "PostgreSQL"],
        seniority: "mid",
        maxCapacity: 100,
      },
      {
        email: "meera@company.com",
        password: "password123",
        name: "Meera Desai",
        role: "engineer",
        skills: ["React", "Vue.js", "CSS"],
        seniority: "junior",
        maxCapacity: 50, // Part-time
      },
      {
        email: "arjun@company.com",
        password: "password123",
        name: "Arjun Kumar",
        role: "engineer",
        skills: ["Node.js", "MongoDB", "Express"],
        seniority: "senior",
        maxCapacity: 100,
      },
    ];

    const savedEngineers = [];
    for (const engineerData of engineers) {
      const engineer = new User(engineerData);
      await engineer.save();
      savedEngineers.push(engineer);
    }

    // Create projects
    const projects = [
      {
        name: "E-commerce Platform",
        description:
          "Building a new e-commerce platform with React and Node.js",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        requiredSkills: ["React", "Node.js", "TypeScript"],
        teamSize: 3,
        status: "active",
        managerId: manager._id,
      },
      {
        name: "Data Analytics Dashboard",
        description:
          "Python-based analytics dashboard for business intelligence",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-31"),
        requiredSkills: ["Python", "Django", "PostgreSQL"],
        teamSize: 2,
        status: "active",
        managerId: manager._id,
      },
      {
        name: "Mobile App Redesign",
        description: "Redesigning the mobile app interface",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-07-31"),
        requiredSkills: ["React", "Vue.js", "CSS"],
        teamSize: 2,
        status: "planning",
        managerId: manager._id,
      },
      {
        name: "API Microservices",
        description: "Building microservices architecture",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-08-31"),
        requiredSkills: ["Node.js", "MongoDB", "Express"],
        teamSize: 2,
        status: "planning",
        managerId: manager._id,
      },
    ];

    const savedProjects = [];
    for (const projectData of projects) {
      const project = new Project(projectData);
      await project.save();
      savedProjects.push(project);
    }

    // Create assignments
    const assignments = [
      {
        engineerId: savedEngineers[0]._id, // Anita
        projectId: savedProjects[0]._id, // E-commerce Platform
        allocationPercentage: 80,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        role: "Tech Lead",
      },
      {
        engineerId: savedEngineers[1]._id, // Vikram
        projectId: savedProjects[1]._id, // Data Analytics Dashboard
        allocationPercentage: 100,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-31"),
        role: "Backend Developer",
      },
      {
        engineerId: savedEngineers[2]._id, // Meera
        projectId: savedProjects[0]._id, // E-commerce Platform
        allocationPercentage: 50,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-06-30"),
        role: "Frontend Developer",
      },
      {
        engineerId: savedEngineers[3]._id, // Arjun
        projectId: savedProjects[0]._id, // E-commerce Platform
        allocationPercentage: 60,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        role: "Backend Developer",
      },
    ];

    for (const assignmentData of assignments) {
      const assignment = new Assignment(assignmentData);
      await assignment.save();
    }

    console.log("Seed data created successfully!");
    console.log("Login credentials:");
    console.log("Manager: manager@company.com / password123");
    console.log(
      "Engineers: anita@company.com, vikram@company.com, meera@company.com, arjun@company.com / password123"
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
