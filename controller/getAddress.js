// ==========================================
// GET ADDRESS
// ==========================================

const connection = require("../config/dbconfig");

function getAddress(req, res) {
  console.log("Getting address...");

  const user_id = req.headers.user_id;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const query = `
    SELECT
      id,
      user_id,
      full_name,
      mobile,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      landmark,
      created_at,
      updated_at
    FROM addresses
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Get address error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch address",
      });
    }

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No address found",
        address: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address: results[0],
    });
  });
}

module.exports = getAddress;
