const connection = require("../config/dbconfig");

function addSubcategory(req, res) {
  console.log("Adding subcategory...");

  const { category_id, name, image, is_active } = req.body;

  // Validation
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

    // Add subcategory
    const addSubcategoryQuery = `
        INSERT INTO subcategories
        (category_id, name, image, is_active)
        VALUES (?, ?, ?, ?)
      `;

    connection.query(
      addSubcategoryQuery,
      [
        category_id,
        name,
        image || null,
        is_active !== undefined ? is_active : 1,
      ],
      (err, result) => {
        if (err) {
          console.error("Error adding subcategory:", err);

          return res.status(500).json({
            message: "Server error while adding subcategory",
          });
        }

        return res.status(201).json({
          message: "Subcategory added successfully",
          subcategory: {
            id: result.insertId,
            category_id: category_id,
            name: name,
            image: image || null,
            is_active: is_active !== undefined ? is_active : 1,
          },
        });
      },
    );
  });
}

module.exports = addSubcategory;
