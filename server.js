// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(express.json());


const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI); // Use environment variable for security
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
    }
  };


  const otpRoutes = require("./routes/otpRoutes");
  const userRoutes = require("./routes/userRoutes");

app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);

  

// Root Route
app.get("/", (req, res) => {
  res.send(`<html>
    <head>
      <title>Bluebex WhatsApp API Server</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: #f2f2f2; 
          padding: 30px; 
        }
        .container { 
          max-width: 700px; 
          margin: auto; 
          background: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
        }
        h1 { 
          color: #27ae60; 
        }
        ul { 
          line-height: 1.8; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Bluebex Meta WhatsApp API Server is Running Smoothly!</h1>
        <p>🎉 Everything is working well. The API is live and fully functional.</p>
        <p>This server powers the Meta WhatsApp integration and supports core authentication features.</p>
        <p>Available endpoints:</p>
        <ul>
          <li><strong>POST</strong> /login</li>
          <li><strong>POST</strong> /register</li>
          <li><strong>GET</strong> /get-all-users</li>
        </ul>
        <p><strong>🌐 Domain:</strong> <a href="http://bluebex.xyz">http://bluebex.xyz</a></p>
        <p><strong>🔗 Public IP:</strong> Also accessible via server IP <a href="http://15.206.226.196">http://15.206.226.196</a></p>
        <p><strong>🔐 Secure Access:</strong> Use <a href="https://bluebex.xyz">https://bluebex.xyz</a> for HTTPS access</p>
        <p><strong>🗄️ MongoDB:</strong> ✅ Connected successfully</p>
        <p><strong>⚙️ API Status:</strong> ✅ API is working well</p>
      </div>
    </body>
  </html>`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://15.206.226.196`);
  connect();  //connection to datbase
});
