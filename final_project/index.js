require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/customer", session({
  secret: process.env.SESSION_SECRET || "fingerprint_customer",
  resave: true,
  saveUninitialized: true,
}));

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    try {
      jwt.verify(token, process.env.JWT_SECRET || "access", (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
      });
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
