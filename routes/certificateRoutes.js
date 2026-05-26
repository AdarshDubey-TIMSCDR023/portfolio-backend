const express = require("express");
const router = express.Router();

const multer = require("multer");

const cloudinary = require("../config/cloudinary");

const Certificate = require("../models/Certificate");


// ================= MULTER CONFIG =================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});


// ================= UPLOAD CERTIFICATE =================
router.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {
    try {
      const { title } = req.body;

      // Validation
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Certificate title is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      // Convert image buffer to base64
      const fileBase64 =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        fileBase64,
        {
          folder: "certificates",
        }
      );

      // Save in MongoDB
      const certificate = await Certificate.create({
        title,
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });

      res.status(201).json({
        success: true,
        message: "✅ Certificate Uploaded Successfully",
        data: certificate,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);


// ================= GET ALL CERTIFICATES =================
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: certificates.length,
      data: certificates,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ================= DELETE CERTIFICATE =================
router.delete("/:id", async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(
      certificate.public_id
    );

    // Delete from MongoDB
    await Certificate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "✅ Certificate Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;