const connection = require("../config/dbconfig");

function getDriveDetails(req, res) {
  console.log("Fetching drive details...");

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Drive ID is required",
    });
  }

  const getDriveQuery = `
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
      p.mrp AS product_mrp,
      p.price AS product_price,

      d.title,
      d.normal_price,
      d.start_date,
      d.end_date,
      d.status,
      d.final_participants,
      d.final_price,
      d.created_at,
      d.updated_at

    FROM drives d

    LEFT JOIN vendors v
      ON d.vendor_id = v.id

    LEFT JOIN products p
      ON d.product_id = p.id

    WHERE d.id = ?
  `;

  connection.query(getDriveQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching drive details:", err);

      return res.status(500).json({
        message: "Server error while fetching drive details",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Drive not found",
      });
    }

    return res.status(200).json({
      message: "Drive details fetched successfully",
      drive: results[0],
    });
  });
}

module.exports = getDriveDetails;
