const connection = require("../config/dbconfig");

const VALID_STATUSES = ["DRAFT", "ACTIVE", "ENDED", "SETTLED", "CANCELLED"];

// ============================================================
// GET ALL DRIVES
// ============================================================

function getAdminAllDrives(req, res) {
  console.log("Getting all drives...");

  const query = `
    SELECT
      d.id,
      d.vendor_id,
      v.name AS vendor_name,
      d.product_id,
      p.name AS product_name,
      p.image AS product_image,
      d.title,
      d.start_date,
      d.end_date,
      d.minimum_participants,
      d.maximum_participants,
      d.current_participants,
      d.status,
      d.created_at,
      d.updated_at
    FROM drives d
    LEFT JOIN vendors v ON d.vendor_id = v.id
    LEFT JOIN products p ON d.product_id = p.id
    ORDER BY d.id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all drives error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get drives",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Drives fetched successfully",
      drives: results,
    });
  });
}

// ============================================================
// ADD DRIVE
// ============================================================

function addDrive(req, res) {
  console.log("Adding drive...");

  const {
    vendor_id,
    product_id,
    title,
    start_date,
    end_date,
    minimum_participants,
    maximum_participants,
    current_participants,
    status,
  } = req.body;

  if (
    !vendor_id ||
    !Number.isInteger(Number(vendor_id)) ||
    Number(vendor_id) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid vendor ID is required",
    });
  }

  if (
    !product_id ||
    !Number.isInteger(Number(product_id)) ||
    Number(product_id) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid product ID is required",
    });
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Drive title is required",
    });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required",
    });
  }

  const startTimestamp = new Date(start_date).getTime();
  const endTimestamp = new Date(end_date).getTime();

  if (!Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date or end date",
    });
  }

  if (endTimestamp <= startTimestamp) {
    return res.status(400).json({
      success: false,
      message: "End date must be after the start date",
    });
  }

  const minimumValue =
    minimum_participants !== undefined &&
    minimum_participants !== null &&
    minimum_participants !== ""
      ? Number(minimum_participants)
      : 1;

  const maximumValue =
    maximum_participants !== undefined &&
    maximum_participants !== null &&
    maximum_participants !== ""
      ? Number(maximum_participants)
      : null;

  // New drives start with zero participants.
  const currentValue =
    current_participants !== undefined &&
    current_participants !== null &&
    current_participants !== ""
      ? Number(current_participants)
      : 0;

  if (!Number.isInteger(minimumValue) || minimumValue < 1) {
    return res.status(400).json({
      success: false,
      message: "Minimum participants must be an integer of at least 1",
    });
  }

  if (
    maximumValue !== null &&
    (!Number.isInteger(maximumValue) || maximumValue < minimumValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Maximum participants must be at least the minimum participants",
    });
  }

  if (
    !Number.isInteger(currentValue) ||
    currentValue < 0 ||
    (maximumValue !== null && currentValue > maximumValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid current participants count",
    });
  }

  const statusValue = status || "DRAFT";

  if (
    typeof statusValue !== "string" ||
    !VALID_STATUSES.includes(statusValue.toUpperCase())
  ) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
    });
  }

  // Check that vendor exists.
  const vendorQuery = `
    SELECT id
    FROM vendors
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(
    vendorQuery,
    [Number(vendor_id)],
    (vendorError, vendorResults) => {
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

      // Check that product exists.
      const productQuery = `
        SELECT id
        FROM products
        WHERE id = ?
        LIMIT 1
      `;

      connection.query(
        productQuery,
        [Number(product_id)],
        (productError, productResults) => {
          if (productError) {
            console.error("Check product error:", productError);

            return res.status(500).json({
              success: false,
              message: "Failed to check product",
            });
          }

          if (productResults.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Product not found",
            });
          }

          const insertQuery = `
            INSERT INTO drives (
              vendor_id,
              product_id,
              title,
              start_date,
              end_date,
              minimum_participants,
              maximum_participants,
              current_participants,
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          connection.query(
            insertQuery,
            [
              Number(vendor_id),
              Number(product_id),
              title.trim(),
              start_date,
              end_date,
              minimumValue,
              maximumValue,
              currentValue,
              statusValue.toUpperCase(),
            ],
            (insertError, insertResult) => {
              if (insertError) {
                console.error("Add drive error:", insertError);

                return res.status(500).json({
                  success: false,
                  message: "Failed to add drive",
                });
              }

              return res.status(201).json({
                success: true,
                message: "Drive added successfully",
                drive_id: insertResult.insertId,
              });
            },
          );
        },
      );
    },
  );
}

// ============================================================
// EDIT DRIVE
// ============================================================

function editDrive(req, res) {
  console.log("Editing drive...");

  const {
    id,
    vendor_id,
    product_id,
    title,
    start_date,
    end_date,
    minimum_participants,
    maximum_participants,
    current_participants,
    status,
  } = req.body;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid drive ID is required",
    });
  }

  if (
    !vendor_id ||
    !Number.isInteger(Number(vendor_id)) ||
    Number(vendor_id) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid vendor ID is required",
    });
  }

  if (
    !product_id ||
    !Number.isInteger(Number(product_id)) ||
    Number(product_id) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid product ID is required",
    });
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Drive title is required",
    });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required",
    });
  }

  const startTimestamp = new Date(start_date).getTime();
  const endTimestamp = new Date(end_date).getTime();

  if (
    !Number.isFinite(startTimestamp) ||
    !Number.isFinite(endTimestamp) ||
    endTimestamp <= startTimestamp
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid dates. End date must be after start date",
    });
  }

  const minimumValue = Number(minimum_participants);

  const maximumValue =
    maximum_participants !== undefined &&
    maximum_participants !== null &&
    maximum_participants !== ""
      ? Number(maximum_participants)
      : null;

  const currentValue = Number(current_participants);

  if (!Number.isInteger(minimumValue) || minimumValue < 1) {
    return res.status(400).json({
      success: false,
      message: "Minimum participants must be an integer of at least 1",
    });
  }

  if (
    maximumValue !== null &&
    (!Number.isInteger(maximumValue) || maximumValue < minimumValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Maximum participants must be at least the minimum participants",
    });
  }

  if (
    !Number.isInteger(currentValue) ||
    currentValue < 0 ||
    (maximumValue !== null && currentValue > maximumValue)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid current participants count",
    });
  }

  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status.toUpperCase())
  ) {
    return res.status(400).json({
      success: false,
      message: `Valid status is required: ${VALID_STATUSES.join(", ")}`,
    });
  }

  // Check drive exists.
  const driveQuery = `
    SELECT id
    FROM drives
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(driveQuery, [Number(id)], (driveError, driveResults) => {
    if (driveError) {
      console.error("Check drive error:", driveError);

      return res.status(500).json({
        success: false,
        message: "Failed to check drive",
      });
    }

    if (driveResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Drive not found",
      });
    }

    // Check vendor and product.
    const referenceQuery = `
        SELECT
          (SELECT COUNT(*) FROM vendors WHERE id = ?) AS vendor_exists,
          (SELECT COUNT(*) FROM products WHERE id = ?) AS product_exists
      `;

    connection.query(
      referenceQuery,
      [Number(vendor_id), Number(product_id)],
      (referenceError, referenceResults) => {
        if (referenceError) {
          console.error("Check references error:", referenceError);

          return res.status(500).json({
            success: false,
            message: "Failed to validate vendor and product",
          });
        }

        if (referenceResults[0].vendor_exists === 0) {
          return res.status(404).json({
            success: false,
            message: "Vendor not found",
          });
        }

        if (referenceResults[0].product_exists === 0) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const updateQuery = `
            UPDATE drives
            SET
              vendor_id = ?,
              product_id = ?,
              title = ?,
              start_date = ?,
              end_date = ?,
              minimum_participants = ?,
              maximum_participants = ?,
              current_participants = ?,
              status = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;

        connection.query(
          updateQuery,
          [
            Number(vendor_id),
            Number(product_id),
            title.trim(),
            start_date,
            end_date,
            minimumValue,
            maximumValue,
            currentValue,
            status.toUpperCase(),
            Number(id),
          ],
          (updateError) => {
            if (updateError) {
              console.error("Edit drive error:", updateError);

              return res.status(500).json({
                success: false,
                message: "Failed to edit drive",
              });
            }

            return res.status(200).json({
              success: true,
              message: "Drive updated successfully",
              drive_id: Number(id),
            });
          },
        );
      },
    );
  });
}

// ============================================================
// DELETE DRIVE
// ============================================================

function removeDrive(req, res) {
  console.log("Removing drive...");

  const id = req.body.id || req.query.id;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid drive ID is required",
    });
  }

  const checkQuery = `
    SELECT id, current_participants
    FROM drives
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [Number(id)], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check drive error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check drive",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Drive not found",
      });
    }

    const deleteQuery = `
        DELETE FROM drives
        WHERE id = ?
      `;

    connection.query(deleteQuery, [Number(id)], (deleteError) => {
      if (deleteError) {
        console.error("Delete drive error:", deleteError);

        return res.status(409).json({
          success: false,
          message:
            "Failed to delete drive. It may be referenced by price tiers, carts, or orders.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Drive deleted successfully",
        drive_id: Number(id),
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAdminAllDrives,
  addDrive,
  editDrive,
  removeDrive,
};
