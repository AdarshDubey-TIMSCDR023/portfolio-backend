const express = require("express");
const router = express.Router();

const multer = require("multer");

const cloudinary = require("../config/cloudinary");

const Project = require("../models/Project");


// ================= MULTER CONFIG =================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});


// ================= CREATE PROJECT =================
router.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {
    try {

      const {
        title,
        description,
        githubLink,
        liveLink,
        techStack,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Project image required",
        });
      }

      // Convert image to base64
      const fileBase64 =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload image
      const result = await cloudinary.uploader.upload(
        fileBase64,
        {
          folder: "projects",
        }
      );

      // Save project
      const project = await Project.create({
        title,
        description,
        githubLink,
        liveLink,
        techStack: techStack.split(","),
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });

      res.status(201).json({
        success: true,
        message: "✅ Project Uploaded Successfully",
        data: project,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);


// ================= GET PROJECTS =================
router.get("/", async (req, res) => {
  try {

    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: projects.length,
      data: projects,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ================= DELETE PROJECT =================
router.delete("/:id", async (req, res) => {
  try {

    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete image
    await cloudinary.uploader.destroy(
      project.public_id
    );

    // Delete DB
    await Project.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "✅ Project Deleted",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;