const mongoose = require("mongoose");

const resumeSchema =
  new mongoose.Schema(

    {

      title: {
        type: String,
        required: true,
        trim: true,
      },

      // PDF URL
      resumeUrl: {
        type: String,
        required: true,
      },

      // Cloudinary Public ID
      public_id: {
        type: String,
        required: true,
      },

      // File Name
      fileName: {
        type: String,
        default:
          "Adarsh_Dubey_Resume.pdf",
      },

      // File Type
      fileType: {
        type: String,
        default: "application/pdf",
      },

      // File Size
      fileSize: {
        type: Number,
        default: 0,
      },

    },

    {
      timestamps: true,
    }

  );

module.exports =
  mongoose.model(
    "Resume",
    resumeSchema
  );
