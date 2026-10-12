// ==========================================
// EDIT / CREATE ADDRESS
// ==========================================

const connection = require("../config/dbconfig");

function editAddress(req, res) {
  console.log("Editing / creating address...");

  // ==========================================
  // GET USER ID FROM JWT
  // ==========================================

  const user_id = req.headers.user_id;

  // ==========================================
  // REQUEST BODY
  // ==========================================

  const {
    full_name,
    mobile,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    landmark,
  } = req.body;

  // ==========================================
  // VALIDATION
  // ==========================================

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!full_name || !mobile || !address_line1 || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing",
    });
  }

  // ==========================================
  // CHECK IF ADDRESS ALREADY EXISTS
  // ==========================================

  const checkQuery = `
    SELECT id
    FROM addresses
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [user_id], (checkError, results) => {
    if (checkError) {
      console.error("Error checking address:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check address",
      });
    }

    // ==========================================
    // ADDRESS EXISTS -> UPDATE
    // ==========================================

    if (results.length > 0) {
      const address_id = results[0].id;

      const updateQuery = `
          UPDATE addresses
          SET
            full_name = ?,
            mobile = ?,
            address_line1 = ?,
            address_line2 = ?,
            city = ?,
            state = ?,
            pincode = ?,
            landmark = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND user_id = ?
        `;

      const updateValues = [
        full_name.trim(),
        mobile.trim(),
        address_line1.trim(),
        address_line2 ? address_line2.trim() : null,
        city.trim(),
        state.trim(),
        pincode.trim(),
        landmark ? landmark.trim() : null,
        address_id,
        user_id,
      ];

      connection.query(
        updateQuery,
        updateValues,
        (updateError, updateResult) => {
          if (updateError) {
            console.error("Update address error:", updateError);

            return res.status(500).json({
              success: false,
              message: "Failed to update address",
            });
          }

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Address could not be updated",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: {
              id: address_id,
              user_id: user_id,
              full_name: full_name.trim(),
              mobile: mobile.trim(),
              address_line1: address_line1.trim(),
              address_line2: address_line2 ? address_line2.trim() : null,
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              landmark: landmark ? landmark.trim() : null,
            },
          });
        },
      );

      return;
    }

    // ==========================================
    // ADDRESS DOES NOT EXIST -> CREATE
    // ==========================================

    const insertQuery = `
        INSERT INTO addresses (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

    const insertValues = [
      user_id,
      full_name.trim(),
      mobile.trim(),
      address_line1.trim(),
      address_line2 ? address_line2.trim() : null,
      city.trim(),
      state.trim(),
      pincode.trim(),
      landmark ? landmark.trim() : null,
    ];

    connection.query(insertQuery, insertValues, (insertError, insertResult) => {
      if (insertError) {
        console.error("Create address error:", insertError);

        return res.status(500).json({
          success: false,
          message: "Failed to create address",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Address created successfully",
        address: {
          id: insertResult.insertId,
          user_id: user_id,
          full_name: full_name.trim(),
          mobile: mobile.trim(),
          address_line1: address_line1.trim(),
          address_line2: address_line2 ? address_line2.trim() : null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          landmark: landmark ? landmark.trim() : null,
        },
      });
    });
  });
}

module.exports = editAddress;
