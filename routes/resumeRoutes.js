const express = require("express");
const router = express.Router();

const multer = require("multer");

const cloudinary = require("../config/cloudinary");

const Resume = require("../models/Resume");


// ================= MULTER CONFIG =================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});


// ================= UPLOAD RESUME =================
router.post(
  "/upload",
  upload.single("resume"),
  async (req, res) => {
    try {

      const { title } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Resume file is required",
        });
      }

      // Convert file to base64
      const fileBase64 =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload PDF
      const result =
        await cloudinary.uploader.upload(
          fileBase64,
          {
            folder: "resume",
            resource_type: "raw",
          }
        );

      // Save DB
      const resume = await Resume.create({
        title,
        resumeUrl: result.secure_url,
        public_id: result.public_id,
      });

      res.status(201).json({
        success: true,
        message:
          "✅ Resume Uploaded Successfully",
        data: resume,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);


// ================= GET RESUME =================
router.get("/", async (req, res) => {
  try {

    const resume = await Resume.findOne().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: resume,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ================= DELETE RESUME =================
router.delete("/:id", async (req, res) => {
  try {

    const resume = await Resume.findById(
      req.params.id
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(
      resume.public_id,
      {
        resource_type: "raw",
      }
    );

    // Delete from DB
    await Resume.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "✅ Resume Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;