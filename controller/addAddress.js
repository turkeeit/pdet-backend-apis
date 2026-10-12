const connection = require("../config/dbconfig");

// ==========================================
// ADD ADDRESS
// ==========================================

function addAddress(req, res) {
  console.log("Adding address...");

  const mobile = req.headers.mobile_number;
  const user_id = req.headers.user_id;

  const {
    full_name,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    landmark,
  } = req.body;

  // Validation
  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!full_name || !user_id || !address_line1 || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing",
    });
  }

  // Check if user already has an address
  const checkQuery = `
    SELECT id
    FROM addresses
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [user_id], (err, results) => {
    if (err) {
      console.error("Check address error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to check address",
      });
    }

    // User already has address
    if (results.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Address already exists. Please edit your existing address.",
      });
    }

    // Insert address
    const insertQuery = `
      INSERT INTO addresses
      (
        user_id,
        full_name,
        mobile,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      full_name,
      mobile,
      address_line1,
      address_line2 || null,
      city,
      state,
      pincode,
      landmark || null,
    ];

    connection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Add address error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to add address",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Address added successfully",
        address_id: result.insertId,
      });
    });
  });
}

module.exports = addAddress;
