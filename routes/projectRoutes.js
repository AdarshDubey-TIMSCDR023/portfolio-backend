const express = require("express");

const router = express.Router();

const multer = require("multer");

const cloudinary =
  require("../config/cloudinary");

const Project =
  require("../models/Project");


// ================= MULTER CONFIG =================

const storage =
  multer.memoryStorage();

const upload = multer({
  storage,
});


// ================= CREATE PROJECT =================

router.post(

  "/upload",

  upload.single("image"),

  async (req, res) => {

    try {

      console.log(req.body);

      console.log(req.file);

      const {
        title,
        description,
        githubLink,
        liveLink,
        techStack,
      } = req.body;

      // ================= VALIDATION =================

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Project image required",

        });

      }

      // ================= BASE64 =================

      const fileBase64 =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // ================= CLOUDINARY UPLOAD =================

      const result =
        await cloudinary.uploader.upload(

          fileBase64,

          {

            folder: "projects",

            resource_type: "image",

            use_filename: true,

            unique_filename: false,

            overwrite: true,

          }

        );

      // ================= SAVE PROJECT =================

      const project =
        await Project.create({

          title,

          description,

          githubLink,

          liveLink,

          techStack:
            techStack
              ? techStack.split(",")
              : [],

          imageUrl:
            result.secure_url,

          public_id:
            result.public_id,

        });

      // ================= RESPONSE =================

      res.status(201).json({

        success: true,

        message:
          "✅ Project Uploaded Successfully",

        data: project,

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


// ================= GET PROJECTS =================

router.get(

  "/",

  async (req, res) => {

    try {

      const projects =
        await Project.find().sort({

          createdAt: -1,

        });

      res.status(200).json({

        success: true,

        total:
          projects.length,

        data: projects,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        error: error.message,

      });

    }

  }

);


// ================= DELETE PROJECT =================

router.delete(

  "/:id",

  async (req, res) => {

    try {

      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found",

        });

      }

      // ================= DELETE IMAGE =================

      await cloudinary.uploader.destroy(

        project.public_id,

        {
          resource_type: "image",
        }

      );

      // ================= DELETE DB =================

      await Project.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "✅ Project Deleted",

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
