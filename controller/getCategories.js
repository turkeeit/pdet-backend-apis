const connection = require("../config/dbconfig");

function getCategories(req, res) {
  console.log("Fetching categories...");

  const getCategoriesQuery = `
    SELECT
      id,
      name,
      image,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY id DESC
  `;

  connection.query(getCategoriesQuery, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);

      return res.status(500).json({
        message: "Server error while fetching categories",
      });
    }

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories: results,
    });
  });
}

module.exports = getCategories;
