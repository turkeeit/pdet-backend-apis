const connection = require("../config/dbconfig");

function editCategory(req, res) {
  console.log("Updating category...");

  const { id } = req.params;

  const { name, image, is_active } = req.body;

  // Validation
  if (!id) {
    return res.status(400).json({
      message: "Category ID is required",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  // Update category
  const updateCategoryQuery = `
    UPDATE categories
    SET name = ?, image = ?, is_active = ?
    WHERE id = ?
  `;

  connection.query(
    updateCategoryQuery,
    [name, image || null, is_active !== undefined ? is_active : 1, id],
    (err, result) => {
      if (err) {
        console.error("Error updating category:", err);

        return res.status(500).json({
          message: "Server error while updating category",
        });
      }

      // Category not found
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      return res.status(200).json({
        message: "Category updated successfully",
      });
    },
  );
}

module.exports = editCategory;
