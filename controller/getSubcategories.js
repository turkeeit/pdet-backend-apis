const connection = require("../config/dbconfig");

function getSubcategories(req, res) {
  console.log("Fetching subcategories...");

  const getSubcategoriesQuery = `
    SELECT
      s.id,
      s.category_id,
      c.name AS category_name,
      s.name,
      s.image,
      s.is_active,
      s.created_at,
      s.updated_at
    FROM subcategories s
    LEFT JOIN categories c
      ON s.category_id = c.id
    ORDER BY s.id DESC
  `;

  connection.query(getSubcategoriesQuery, (err, results) => {
    if (err) {
      console.error("Error fetching subcategories:", err);

      return res.status(500).json({
        message: "Server error while fetching subcategories",
      });
    }

    return res.status(200).json({
      message: "Subcategories fetched successfully",
      subcategories: results,
    });
  });
}

module.exports = getSubcategories;
