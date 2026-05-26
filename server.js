const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();


// ================= MODELS =================
const Contact = require("./models/Contact");


// ================= ROUTES =================
const certificateRoutes = require(
  "./routes/certificateRoutes"
);

const projectRoutes = require(
  "./routes/projectRoutes"
);

const resumeRoutes = require(
  "./routes/resumeRoutes"
);


const app = express();


// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ================= DATABASE CONNECTION =================
const connectDB = async () => {
  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB Connected Successfully"
    );

  } catch (error) {

    console.log(
      "❌ MongoDB Connection Error"
    );

    console.log(error.message);

    process.exit(1);
  }
};

connectDB();


// ================= HOME ROUTE =================
app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message:
      "🚀 Portfolio Backend Running Successfully",
  });
});


// ================= TEST ROUTE =================
app.get("/api/test", (req, res) => {

  res.status(200).json({
    success: true,
    message:
      "✅ API Working Successfully",
  });
});


// ================= MONGODB TEST =================
app.get("/api/mongodb-test", (req, res) => {

  const dbState =
    mongoose.connection.readyState;

  /*
    0 = disconnected
    1 = connected
    2 = connecting
    3 = disconnecting
  */

  if (dbState === 1) {

    res.status(200).json({
      success: true,
      database: "Connected",
      message:
        "✅ MongoDB Connected Successfully",
    });

  } else {

    res.status(500).json({
      success: false,
      database: "Disconnected",
      message:
        "❌ MongoDB Not Connected",
    });
  }
});


// ================= CONTACT API =================
app.post("/api/contact", async (req, res) => {

  try {

    const {
      name,
      email,
      message,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !message
    ) {

      return res.status(400).json({
        success: false,
        message:
          "All fields are required",
      });
    }

    // Save contact
    const newContact =
      await Contact.create({
        name,
        email,
        message,
      });

    res.status(201).json({
      success: true,
      message:
        "✅ Message Sent Successfully",
      data: newContact,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ================= GET CONTACTS =================
app.get("/api/contacts", async (req, res) => {

  try {

    const contacts =
      await Contact.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: contacts.length,
      data: contacts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ================= CERTIFICATE ROUTES =================
app.use(
  "/api/certificates",
  certificateRoutes
);


// ================= PROJECT ROUTES =================
app.use(
  "/api/projects",
  projectRoutes
);


// ================= RESUME ROUTES =================
app.use(
  "/api/resume",
  resumeRoutes
);


// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {

  res.status(200).json({
    success: true,
    message: "Server Healthy ✅",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});


// ================= 404 ROUTE =================
app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "❌ Route Not Found",
  });
});


// ================= ERROR HANDLER =================
app.use(
  (err, req, res, next) => {

    console.log(
      "❌ Server Error:",
      err.stack
    );

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
      error: err.message,
    });
  }
);


// ================= PORT =================
const PORT =
  process.env.PORT || 5000;


// ================= SERVER =================
app.listen(PORT, () => {

  console.log(
    `🚀 Server Running on Port ${PORT}`
  );
});