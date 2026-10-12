const connection = require("../config/dbconfig");

function getDrivesByProduct(req, res) {
  console.log("Fetching drives by product...");

  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  const getDrivesQuery = `
    SELECT
      d.id,

      d.vendor_id,
      v.name AS vendor_name,
      v.mobile AS vendor_mobile,
      v.email AS vendor_email,

      d.product_id,
      p.name AS product_name,
      p.description AS product_description,
      p.image AS product_image,
      p.price AS product_price,

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

    LEFT JOIN vendors v
      ON d.vendor_id = v.id

    LEFT JOIN products p
      ON d.product_id = p.id

    WHERE d.product_id = ?

    ORDER BY d.id DESC
  `;

  connection.query(getDrivesQuery, [product_id], (err, drives) => {
    if (err) {
      console.error("Error fetching drives by product:", err);

      return res.status(500).json({
        message: "Server error while fetching drives",
      });
    }

    if (drives.length === 0) {
      return res.status(200).json({
        message: "No drives found for this product",
        drives: [],
      });
    }

    // Get price tiers for all drives
    const driveIds = drives.map((drive) => drive.id);

    const getPriceTiersQuery = `
        SELECT
          id,
          drive_id,
          minimum_participants,
          price,
          created_at,
          updated_at

        FROM drive_price_tiers

        WHERE drive_id IN (?)

        ORDER BY minimum_participants ASC
      `;

    connection.query(getPriceTiersQuery, [driveIds], (err, priceTiers) => {
      if (err) {
        console.error("Error fetching drive price tiers:", err);

        return res.status(500).json({
          message: "Server error while fetching drive price tiers",
        });
      }

      // Attach price tiers to each drive
      const drivesWithPriceTiers = drives.map((drive) => {
        return {
          ...drive,
          price_tiers: priceTiers.filter((tier) => tier.drive_id === drive.id),
        };
      });

      return res.status(200).json({
        message: "Drives fetched successfully",
        drives: drivesWithPriceTiers,
      });
    });
  });
}

module.exports = getDrivesByProduct;
