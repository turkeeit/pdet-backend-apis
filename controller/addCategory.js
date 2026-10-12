const connection = require("../config/dbconfig");

function addCategory(req, res) {
  7;
  console.log("Adding category...");

  const { name, image, is_active } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  // Add category
  const addCategoryQuery = `
    INSERT INTO categories
    (name, image, is_active)
    VALUES (?, ?, ?)
  `;

  connection.query(
    addCategoryQuery,
    [name, image || null, is_active !== undefined ? is_active : 1],
    (err, result) => {
      if (err) {
        console.error("Error adding category:", err);

        return res.status(500).json({
          message: "Server error while adding category",
        });
      }

      return res.status(201).json({
        message: "Category added successfully",
        category: {
          id: result.insertId,
          name: name,
          image: image || null,
          is_active: is_active !== undefined ? is_active : 1,
        },
      });
    },
  );
}

module.exports = addCategory;
