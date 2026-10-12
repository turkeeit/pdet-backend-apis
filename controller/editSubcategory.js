const connection = require("../config/dbconfig");

function editSubcategory(req, res) {
  console.log("Updating subcategory...");

  const { id } = req.params;

  const { category_id, name, image, is_active } = req.body;

  // Validation
  if (!id) {
    return res.status(400).json({
      message: "Subcategory ID is required",
    });
  }

  if (!category_id) {
    return res.status(400).json({
      message: "Category ID is required",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Subcategory name is required",
    });
  }

  // Check category exists
  const checkCategoryQuery = `
    SELECT id
    FROM categories
    WHERE id = ?
  `;

  connection.query(checkCategoryQuery, [category_id], (err, categoryResult) => {
    if (err) {
      console.error("Error checking category:", err);

      return res.status(500).json({
        message: "Server error while checking category",
      });
    }

    if (categoryResult.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Update subcategory
    const updateSubcategoryQuery = `
        UPDATE subcategories
        SET
          category_id = ?,
          name = ?,
          image = ?,
          is_active = ?
        WHERE id = ?
      `;

    connection.query(
      updateSubcategoryQuery,
      [
        category_id,
        name,
        image || null,
        is_active !== undefined ? is_active : 1,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating subcategory:", err);

          return res.status(500).json({
            message: "Server error while updating subcategory",
          });
        }

        // Subcategory not found
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Subcategory not found",
          });
        }

        return res.status(200).json({
          message: "Subcategory updated successfully",
        });
      },
    );
  });
}

module.exports = editSubcategory;
