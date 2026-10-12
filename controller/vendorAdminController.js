const connection = require("../config/dbconfig");

// ============================================================
// GET ALL VENDORS
// ============================================================

function getAllVendors(req, res) {
  console.log("Getting all vendors...");

  const query = `
    SELECT
      id,
      name,
      mobile,
      email,
      
      is_active,
      created_at,
      updated_at
    FROM vendors
    ORDER BY id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all vendors error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get vendors",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      vendors: results,
    });
  });
}

// ============================================================
// ADD VENDOR
// ============================================================

function addVendor(req, res) {
  console.log("Adding vendor...");

  const { name, mobile_number, email, address, is_active } = req.body;

  // VALIDATION
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Vendor name is required",
    });
  }

  if (typeof mobile_number !== "string" && typeof mobile_number !== "number") {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  const mobileValue = String(mobile_number).trim();

  if (!mobileValue) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  const emailValue = typeof email === "string" ? email.trim() : "";

  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  const activeValue = is_active !== undefined ? Number(is_active) : 1;

  if (![0, 1].includes(activeValue)) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  // CHECK DUPLICATE MOBILE NUMBER
  const duplicateMobileQuery = `
    SELECT id
    FROM vendors
    WHERE mobile_number = ?
    LIMIT 1
  `;

  connection.query(
    duplicateMobileQuery,
    [mobileValue],
    (mobileError, mobileResults) => {
      if (mobileError) {
        console.error("Check vendor mobile error:", mobileError);

        return res.status(500).json({
          success: false,
          message: "Failed to check vendor mobile number",
        });
      }

      if (mobileResults.length > 0) {
        return res.status(409).json({
          success: false,
          message: "A vendor with this mobile number already exists",
        });
      }

      // CHECK DUPLICATE EMAIL IF PROVIDED
      if (emailValue) {
        const duplicateEmailQuery = `
          SELECT id
          FROM vendors
          WHERE email = ?
          LIMIT 1
        `;

        connection.query(
          duplicateEmailQuery,
          [emailValue],
          (emailError, emailResults) => {
            if (emailError) {
              console.error("Check vendor email error:", emailError);

              return res.status(500).json({
                success: false,
                message: "Failed to check vendor email",
              });
            }

            if (emailResults.length > 0) {
              return res.status(409).json({
                success: false,
                message: "A vendor with this email already exists",
              });
            }

            insertVendor();
          },
        );
      } else {
        insertVendor();
      }

      // INSERT VENDOR
      function insertVendor() {
        const insertQuery = `
          INSERT INTO vendors
          (
            name,
            mobile_number,
            email,
            address,
            is_active
          )
          VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(
          insertQuery,
          [
            name.trim(),
            mobileValue,
            emailValue || null,
            address || null,
            activeValue,
          ],
          (insertError, insertResult) => {
            if (insertError) {
              console.error("Add vendor error:", insertError);

              return res.status(500).json({
                success: false,
                message: "Failed to add vendor",
              });
            }

            return res.status(201).json({
              success: true,
              message: "Vendor added successfully",
              vendor_id: insertResult.insertId,
            });
          },
        );
      }
    },
  );
}

// ============================================================
// EDIT VENDOR
// ============================================================

function editVendor(req, res) {
  console.log("Editing vendor...");

  const { id, name, mobile_number, email, address, is_active } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Vendor ID is required",
    });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Vendor name is required",
    });
  }

  if (typeof mobile_number !== "string" && typeof mobile_number !== "number") {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  const mobileValue = String(mobile_number).trim();

  if (!mobileValue) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  const emailValue = typeof email === "string" ? email.trim() : "";

  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  const activeValue = is_active !== undefined ? Number(is_active) : 1;

  if (![0, 1].includes(activeValue)) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  // CHECK VENDOR EXISTS
  const vendorQuery = `
    SELECT id
    FROM vendors
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(vendorQuery, [id], (vendorError, vendorResults) => {
    if (vendorError) {
      console.error("Check vendor error:", vendorError);

      return res.status(500).json({
        success: false,
        message: "Failed to check vendor",
      });
    }

    if (vendorResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // CHECK DUPLICATE MOBILE NUMBER
    const duplicateMobileQuery = `
        SELECT id
        FROM vendors
        WHERE mobile_number = ?
          AND id != ?
        LIMIT 1
      `;

    connection.query(
      duplicateMobileQuery,
      [mobileValue, id],
      (mobileError, mobileResults) => {
        if (mobileError) {
          console.error("Check duplicate vendor mobile error:", mobileError);

          return res.status(500).json({
            success: false,
            message: "Failed to check vendor mobile number",
          });
        }

        if (mobileResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Another vendor already uses this mobile number",
          });
        }

        // CHECK DUPLICATE EMAIL IF PROVIDED
        if (emailValue) {
          const duplicateEmailQuery = `
              SELECT id
              FROM vendors
              WHERE email = ?
                AND id != ?
              LIMIT 1
            `;

          connection.query(
            duplicateEmailQuery,
            [emailValue, id],
            (emailError, emailResults) => {
              if (emailError) {
                console.error(
                  "Check duplicate vendor email error:",
                  emailError,
                );

                return res.status(500).json({
                  success: false,
                  message: "Failed to check vendor email",
                });
              }

              if (emailResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message: "Another vendor already uses this email",
                });
              }

              updateVendor();
            },
          );
        } else {
          updateVendor();
        }

        // UPDATE VENDOR
        function updateVendor() {
          const updateQuery = `
              UPDATE vendors
              SET
                name = ?,
                mobile_number = ?,
                email = ?,
                address = ?,
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;

          connection.query(
            updateQuery,
            [
              name.trim(),
              mobileValue,
              emailValue || null,
              address || null,
              activeValue,
              id,
            ],
            (updateError) => {
              if (updateError) {
                console.error("Edit vendor error:", updateError);

                return res.status(500).json({
                  success: false,
                  message: "Failed to edit vendor",
                });
              }

              return res.status(200).json({
                success: true,
                message: "Vendor updated successfully",
                vendor_id: id,
              });
            },
          );
        }
      },
    );
  });
}

// ============================================================
// DELETE VENDOR
// ============================================================

function removeVendor(req, res) {
  console.log("Removing vendor...");

  const { id } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Vendor ID is required",
    });
  }

  // CHECK VENDOR EXISTS
  const checkQuery = `
    SELECT id
    FROM vendors
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check vendor error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check vendor",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // DELETE VENDOR
    const deleteQuery = `
        DELETE FROM vendors
        WHERE id = ?
      `;

    connection.query(deleteQuery, [id], (deleteError) => {
      if (deleteError) {
        console.error("Delete vendor error:", deleteError);

        return res.status(500).json({
          success: false,
          message:
            "Failed to delete vendor. The vendor may be referenced by existing drives or orders.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Vendor deleted successfully",
        vendor_id: id,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllVendors,
  addVendor,
  editVendor,
  removeVendor,
};
