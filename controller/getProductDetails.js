const connection = require("../config/dbconfig");

function getProductDetails(req, res) {
  console.log("Fetching product details...");

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  const getProductQuery = `
    SELECT
      p.id,
      p.category_id,
      c.name AS category_name,
      c.image AS category_image,

      p.subcategory_id,
      s.name AS subcategory_name,
      s.image AS subcategory_image,

      p.name,
      p.description,
      p.mrp,
      p.price,
      p.image,
      p.stock,
      p.is_active,
      p.created_at,
      p.updated_at

    FROM products p

    LEFT JOIN categories c
      ON p.category_id = c.id

    LEFT JOIN subcategories s
      ON p.subcategory_id = s.id

    WHERE p.id = ?
  `;

  connection.query(getProductQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching product details:", err);

      return res.status(500).json({
        message: "Server error while fetching product details",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product details fetched successfully",
      product: results[0],
    });
  });
}

module.exports = getProductDetails;
