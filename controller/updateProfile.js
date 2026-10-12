const connection = require("../config/dbconfig");

function updateProfile(req, res) {
  console.log("Updating user profile...");

  const mobile_number = req.headers.mobile_number;

  const { name, email } = req.body;

  // Validation
  if (!mobile_number) {
    return res.status(400).json({
      message: "Mobile number is required",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
    });
  }

  // Update user
  const updateUserQuery = `
    UPDATE users
    SET name = ?, email = ?
    WHERE mobile = ?
  `;

  connection.query(
    updateUserQuery,
    [name, email || null, mobile_number],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);

        return res.status(500).json({
          message: "Server error while updating profile",
        });
      }

      // User not found
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "Profile updated successfully",
      });
    },
  );
}

module.exports = updateProfile;
