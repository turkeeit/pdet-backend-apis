const connection = require("../config/dbconfig");

function updateDrive(req, res) {
  console.log("Updating drive...");

  const { id } = req.params;

  const {
    vendor_id,
    product_id,
    title,
    normal_price,
    start_date,
    end_date,
    status,
    final_participants,
    final_price,
  } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "Drive ID is required",
    });
  }

  if (!vendor_id || !product_id || !title) {
    return res.status(400).json({
      message: "Vendor ID, product ID, and title are required",
    });
  }

  if (normal_price === undefined || normal_price === null) {
    return res.status(400).json({
      message: "Normal price is required",
    });
  }

  if (Number(normal_price) < 0) {
    return res.status(400).json({
      message: "Normal price cannot be negative",
    });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({
      message: "Start date and end date are required",
    });
  }

  if (
    Number.isNaN(new Date(start_date).getTime()) ||
    Number.isNaN(new Date(end_date).getTime()) ||
    new Date(end_date) <= new Date(start_date)
  ) {
    return res.status(400).json({
      message: "Please provide valid dates; end date must be after start date",
    });
  }

  if (
    final_participants !== undefined &&
    (!Number.isInteger(Number(final_participants)) ||
      Number(final_participants) < 0)
  ) {
    return res.status(400).json({
      message: "Final participants must be a non-negative integer",
    });
  }

  if (
    final_price !== undefined &&
    final_price !== null &&
    Number(final_price) < 0
  ) {
    return res.status(400).json({
      message: "Final price cannot be negative",
    });
  }

  const checkDriveQuery = `
    SELECT id
    FROM drives
    WHERE id = ?
  `;

  connection.query(checkDriveQuery, [id], (err, driveResult) => {
    if (err) {
      console.error("Error checking drive:", err);

      return res.status(500).json({
        message: "Server error while checking drive",
      });
    }

    if (driveResult.length === 0) {
      return res.status(404).json({
        message: "Drive not found",
      });
    }

    const checkVendorQuery = `
      SELECT id
      FROM vendors
      WHERE id = ?
    `;

    connection.query(checkVendorQuery, [vendor_id], (err, vendorResult) => {
      if (err) {
        console.error("Error checking vendor:", err);

        return res.status(500).json({
          message: "Server error while checking vendor",
        });
      }

      if (vendorResult.length === 0) {
        return res.status(404).json({
          message: "Vendor not found",
        });
      }

      const checkProductQuery = `
          SELECT id
          FROM products
          WHERE id = ?
        `;

      connection.query(
        checkProductQuery,
        [product_id],
        (err, productResult) => {
          if (err) {
            console.error("Error checking product:", err);

            return res.status(500).json({
              message: "Server error while checking product",
            });
          }

          if (productResult.length === 0) {
            return res.status(404).json({
              message: "Product not found",
            });
          }

          const updateDriveQuery = `
              UPDATE drives
              SET
                vendor_id = ?,
                product_id = ?,
                title = ?,
                normal_price = ?,
                start_date = ?,
                end_date = ?,
                status = ?,
                final_participants = ?,
                final_price = ?
              WHERE id = ?
            `;

          const values = [
            vendor_id,
            product_id,
            title,
            normal_price,
            start_date,
            end_date,
            status || "active",
            final_participants ?? 0,
            final_price ?? null,
            id,
          ];

          connection.query(updateDriveQuery, values, (err, result) => {
            if (err) {
              console.error("Error updating drive:", err);

              return res.status(500).json({
                message: "Server error while updating drive",
              });
            }

            return res.status(200).json({
              message: "Drive updated successfully",
              drive_id: Number(id),
            });
          });
        },
      );
    });
  });
}

module.exports = updateDrive;
