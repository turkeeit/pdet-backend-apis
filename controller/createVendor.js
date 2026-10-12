const connection = require("../config/dbconfig");

function createVendor(req, res) {
  console.log("Creating vendor...");

  const { name, mobile, email, is_active } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Vendor name is required",
    });
  }

  if (!mobile) {
    return res.status(400).json({
      message: "Vendor mobile number is required",
    });
  }

  const checkVendorQuery = `
    SELECT id
    FROM vendors
    WHERE mobile = ?
  `;

  connection.query(checkVendorQuery, [mobile], (err, results) => {
    if (err) {
      console.error("Error checking vendor:", err);

      return res.status(500).json({
        message: "Server error while checking vendor",
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Vendor with this mobile number already exists",
      });
    }

    const createVendorQuery = `
      INSERT INTO vendors (
        name,
        mobile,
        email,
        is_active
      )
      VALUES (?, ?, ?, ?)
    `;

    const vendorStatus = is_active !== undefined ? is_active : 1;

    connection.query(
      createVendorQuery,
      [name, mobile, email || null, vendorStatus],
      (err, result) => {
        if (err) {
          console.error("Error creating vendor:", err);

          return res.status(500).json({
            message: "Server error while creating vendor",
          });
        }

        return res.status(201).json({
          message: "Vendor created successfully",
          vendor: {
            id: result.insertId,
            name,
            mobile,
            email: email || null,
            is_active: vendorStatus,
          },
        });
      },
    );
  });
}

module.exports = createVendor;
