const connection = require("../config/dbconfig");

function createDrive(req, res) {
  console.log("Creating drive...");

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

  if (!vendor_id) {
    return res.status(400).json({
      message: "Vendor ID is required",
    });
  }

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  if (!title) {
    return res.status(400).json({
      message: "Drive title is required",
    });
  }

  if (normal_price === undefined || normal_price === null) {
    return res.status(400).json({
      message: "Normal price is required",
    });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({
      message: "Start date and end date are required",
    });
  }

  if (new Date(end_date) <= new Date(start_date)) {
    return res.status(400).json({
      message: "End date must be after start date",
    });
  }

  if (Number(normal_price) < 0) {
    return res.status(400).json({
      message: "Normal price cannot be negative",
    });
  }

  const checkProductQuery = `
    SELECT id
    FROM products
    WHERE id = ?
  `;

  connection.query(checkProductQuery, [product_id], (err, productResult) => {
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

    const createDriveQuery = `
        INSERT INTO drives (
          vendor_id,
          product_id,
          title,
          normal_price,
          start_date,
          end_date,
          status,
          final_participants,
          final_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ];

    connection.query(createDriveQuery, values, (err, result) => {
      if (err) {
        console.error("Error creating drive:", err);

        return res.status(500).json({
          message: "Server error while creating drive",
        });
      }

      return res.status(201).json({
        message: "Drive created successfully",
        drive: {
          id: result.insertId,
          vendor_id,
          product_id,
          title,
          normal_price,
          start_date,
          end_date,
          status: status || "active",
          final_participants: final_participants ?? 0,
          final_price: final_price ?? null,
        },
      });
    });
  });
}

module.exports = createDrive;
