const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    techStack: {
      type: [String],
      required: true,
    },

    githubLink: {
      type: String,
      required: true,
    },

    liveLink: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Project",
  projectSchema
);