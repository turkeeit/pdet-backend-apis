const connection = require("../config/dbconfig");

function getUserDetails(req, res) {
  console.log("Fetching user details...");

  // Read mobile number from headers
  const mobile_number = req.headers.mobile_number;

  // Validation
  if (!mobile_number) {
    return res.status(400).json({
      message: "Mobile number is required",
    });
  }

  // Get user by mobile number
  const getUserQuery = "SELECT * FROM users WHERE mobile = ?";

  connection.query(getUserQuery, [mobile_number], (err, userResult) => {
    if (err) {
      console.error("Error fetching user:", err);

      return res.status(500).json({
        message: "Server error while fetching user",
      });
    }

    // User not found
    if (userResult.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult[0];

    // Return user details
    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  });
}

module.exports = getUserDetails;
