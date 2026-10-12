const connection = require("../config/dbconfig");

function getProductsByCategory(req, res) {
  console.log("Fetching products by category...");

  const { category_id } = req.params;

  // Validation
  if (!category_id) {
    return res.status(400).json({
      message: "Category ID is required",
    });
  }

  // Get products by category
  const getProductsQuery = `
    SELECT
      id,
      category_id,
      subcategory_id,
      name,
      description,
      price,
      image,
      stock,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE category_id = ?
    AND is_active = 1
    ORDER BY id DESC
  `;

  connection.query(getProductsQuery, [category_id], (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);

      return res.status(500).json({
        message: "Server error while fetching products",
      });
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      products: results,
    });
  });
}

module.exports = getProductsByCategory;
