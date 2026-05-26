const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(

  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      default:
        "Adarsh_Dubey_Resume.pdf",
    },

  },

  {
    timestamps: true,
  }

);

module.exports = mongoose.model(
  "Resume",
  resumeSchema
);
