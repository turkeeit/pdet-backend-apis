require("dotenv").config();

const jwt = require("jsonwebtoken");
const connection = require("../config/dbconfig");

function VerifyJWT(req, res, next) {
  console.log("---- headers ----");
  console.log(req.headers);

  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Authorization header is required",
    });
  }

  const parts = authorization.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  const token = parts[1];

  const secretKey = process.env.secretKey;

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("Error in JWT token verification", err);

      return res.status(401).json({
        message: "Invalid token or token provided is expired",
      });
    }

    const mobile_number = decoded.mobile_number;

    if (!mobile_number) {
      return res.status(401).json({
        message: "Mobile number not found in token",
      });
    }

    // Get user ID using mobile number
    const query = `
      SELECT id, mobile
      FROM users
      WHERE mobile = ?
      LIMIT 1
    `;

    connection.query(query, [mobile_number], (error, result) => {
      if (error) {
        console.log("Database error:", error);

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const user = result[0];

      // Add values to request headers
      req.headers.mobile_number = user.mobile;
      req.headers.user_id = user.id;

      console.log("User ID:", req.headers.user_id);
      console.log("Mobile Number:", req.headers.mobile_number);

      next();
    });
  });
}

module.exports = VerifyJWT;
