const connection = require("../config/dbconfig");

function editProduct(req, res) {
  console.log("Updating product...");

  const { id } = req.params;

  const {
    category_id,
    subcategory_id,
    name,
    description,
    mrp,
    price,
    image,
    stock,
    is_active,
  } = req.body;

  // Validation
  if (!id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  if (!category_id) {
    return res.status(400).json({
      message: "Category ID is required",
    });
  }

  if (!subcategory_id) {
    return res.status(400).json({
      message: "Subcategory ID is required",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Product name is required",
    });
  }

  if (mrp === undefined || mrp === null) {
    return res.status(400).json({
      message: "MRP is required",
    });
  }

  if (price === undefined || price === null) {
    return res.status(400).json({
      message: "Price is required",
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

    // Check subcategory belongs to category
    const checkSubcategoryQuery = `
        SELECT id
        FROM subcategories
        WHERE id = ?
        AND category_id = ?
      `;

    connection.query(
      checkSubcategoryQuery,
      [subcategory_id, category_id],
      (err, subcategoryResult) => {
        if (err) {
          console.error("Error checking subcategory:", err);

          return res.status(500).json({
            message: "Server error while checking subcategory",
          });
        }

        if (subcategoryResult.length === 0) {
          return res.status(404).json({
            message:
              "Subcategory not found or does not belong to this category",
          });
        }

        // Update product
        const updateProductQuery = `
            UPDATE products
            SET
              category_id = ?,
              subcategory_id = ?,
              name = ?,
              description = ?,
              mrp = ?,
              price = ?,
              image = ?,
              stock = ?,
              is_active = ?
            WHERE id = ?
          `;

        connection.query(
          updateProductQuery,
          [
            category_id,
            subcategory_id,
            name,
            description || null,
            mrp,
            price,
            image || null,
            stock !== undefined ? stock : 0,
            is_active !== undefined ? is_active : 1,
            id,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating product:", err);

              return res.status(500).json({
                message: "Server error while updating product",
              });
            }

            // Product not found
            if (result.affectedRows === 0) {
              return res.status(404).json({
                message: "Product not found",
              });
            }

            return res.status(200).json({
              message: "Product updated successfully",
            });
          },
        );
      },
    );
  });
}

module.exports = editProduct;
