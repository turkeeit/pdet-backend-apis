const jwt = require("jsonwebtoken");
require("dotenv").config();

const connection = require("../config/dbconfig");

const secretKey = process.env.secretKey;

async function loginController(req, res) {
  try {
    console.log("Login controller");

    const mobile_number = String(req.headers.mobilenumber || "").trim();

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10 digit mobile number",
      });
    }

    if (!secretKey) {
      console.error("JWT secretKey is not configured");

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Find existing user using mobile number
    const getUserQuery = `
      SELECT *
      FROM users
      WHERE mobile = ?
      LIMIT 1
    `;

    connection.query(getUserQuery, [mobile_number], function (err, results) {
      if (err) {
        console.error("Error fetching user:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch user details",
        });
      }

      // Existing user
      if (results.length > 0) {
        const user = results[0];

        return sendLoginResponse(user, false);
      }

      // New user
      const insertUserQuery = `
          INSERT INTO users (mobile, name, email)
          VALUES (?, ?, ?)
        `;

      connection.query(
        insertUserQuery,
        [mobile_number, "", ""],
        function (insertErr, insertResult) {
          if (insertErr) {
            console.error("Error inserting user:", insertErr);

            // Handle concurrent requests or an existing unique mobile
            if (insertErr.code === "ER_DUP_ENTRY") {
              return connection.query(
                getUserQuery,
                [mobile_number],
                function (fetchErr, existingResults) {
                  if (fetchErr || existingResults.length === 0) {
                    return res.status(500).json({
                      success: false,
                      message: "Failed to fetch user details",
                    });
                  }

                  return sendLoginResponse(existingResults[0], false);
                },
              );
            }

            return res.status(500).json({
              success: false,
              message: "Failed to create user",
            });
          }

          // Fetch the newly created user
          connection.query(
            `SELECT * FROM users WHERE id = ? LIMIT 1`,
            [insertResult.insertId],
            function (fetchErr, newUsers) {
              if (fetchErr || newUsers.length === 0) {
                console.error("Error fetching newly created user:", fetchErr);

                return res.status(500).json({
                  success: false,
                  message: "User created but failed to fetch details",
                });
              }

              return sendLoginResponse(newUsers[0], true);
            },
          );
        },
      );
    });

    // Generate token and return user details
    function sendLoginResponse(user, isNewUser) {
      const payload = {
        id: user.id,
        mobile_number: user.mobile,
      };

      const token = jwt.sign(payload, secretKey, {
        expiresIn: "90d",
      });

      return res.status(isNewUser ? 201 : 200).json({
        success: true,
        message: isNewUser
          ? "User registered successfully"
          : "User login successfully",
        token: token,
        data: {
          id: user.id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
        },
        isNewUser: isNewUser,
      });
    }
  } catch (error) {
    console.error("Login controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = loginController;
