const express = require("express");

const router = express.Router();

const multer = require("multer");

const cloudinary =
  require("../config/cloudinary");

const Resume =
  require("../models/Resume");


// ================= MULTER =================
const storage =
  multer.memoryStorage();

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

      // ================= VALIDATION =================
      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Resume file is required",

        });

      }

      // ================= PDF VALIDATION =================
      if (
        req.file.mimetype !==
        "application/pdf"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Only PDF files are allowed",

        });

      }

      // ================= DELETE OLD RESUME =================
      const oldResume =
        await Resume.findOne();

      if (oldResume) {

        await cloudinary.uploader.destroy(

          oldResume.public_id,

          {
            resource_type: "auto",
          }

        );

        await Resume.findByIdAndDelete(
          oldResume._id
        );

      }

      // ================= BASE64 PDF =================
      const fileBase64 =
        `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;

      // ================= CLOUDINARY UPLOAD =================
      const result =
        await cloudinary.uploader.upload(

          fileBase64,

          {

            folder: "resume",

            resource_type: "auto",

            public_id:
              "Adarsh_Dubey_Resume",

            format: "pdf",

            overwrite: true,

            use_filename: true,

            unique_filename: false,

          }

        );

      // ================= DIRECT PDF URL =================
      const pdfUrl =
        result.secure_url;

      // ================= SAVE DATABASE =================
      const resume =
        await Resume.create({

          title,

          resumeUrl: pdfUrl,

          public_id:
            result.public_id,

          fileName:
            "Adarsh_Dubey_Resume.pdf",

        });

      // ================= RESPONSE =================
      res.status(201).json({

        success: true,

        message:
          "✅ Resume Uploaded Successfully",

        data: resume,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        error: error.message,

      });

    }

  }

);


// ================= GET RESUME =================
router.get(

  "/",

  async (req, res) => {

    try {

      const resume =
        await Resume.findOne().sort({

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

  }

);


// ================= DELETE RESUME =================
router.delete(

  "/:id",

  async (req, res) => {

    try {

      const resume =
        await Resume.findById(
          req.params.id
        );

      if (!resume) {

        return res.status(404).json({

          success: false,

          message:
            "Resume not found",

        });

      }

      // ================= DELETE CLOUDINARY FILE =================
      await cloudinary.uploader.destroy(

        resume.public_id,

        {
          resource_type: "auto",
        }

      );

      // ================= DELETE DATABASE =================
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

  }

);

module.exports = router;
