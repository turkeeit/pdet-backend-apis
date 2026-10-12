const connection = require("../config/dbconfig");

// ============================================================
// GET ALL PRODUCTS
// ============================================================

function getAllProducts(req, res) {
  console.log("Getting all products...");

  const query = `
    SELECT
      p.id,
      p.category_id,
      c.name AS category_name,
      p.subcategory_id,
      s.name AS subcategory_name,
      p.name,
      p.description,
      p.price,
      p.image,
      p.stock,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    ORDER BY p.id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all products error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get products",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: results,
    });
  });
}

// ============================================================
// ADD PRODUCT
// ============================================================

function addAdminProduct(req, res) {
  console.log("Adding product...");

  const {
    category_id,
    subcategory_id,
    name,
    description,
    price,
    image,
    stock,
    is_active,
  } = req.body;

  // VALIDATION
  if (!category_id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  if (!subcategory_id) {
    return res.status(400).json({
      success: false,
      message: "Subcategory ID is required",
    });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product name is required",
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid product price is required",
    });
  }

  const stockValue = stock !== undefined ? Number(stock) : 0;

  if (!Number.isInteger(stockValue) || stockValue < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  const activeValue = is_active !== undefined ? Number(is_active) : 1;

  if (![0, 1].includes(activeValue)) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  // CHECK CATEGORY EXISTS
  const categoryQuery = `
    SELECT id
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(
    categoryQuery,
    [category_id],
    (categoryError, categoryResults) => {
      if (categoryError) {
        console.error("Check category error:", categoryError);

        return res.status(500).json({
          success: false,
          message: "Failed to check category",
        });
      }

      if (categoryResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // CHECK SUBCATEGORY BELONGS TO SELECTED CATEGORY
      const subcategoryQuery = `
        SELECT id
        FROM subcategories
        WHERE id = ?
          AND category_id = ?
        LIMIT 1
      `;

      connection.query(
        subcategoryQuery,
        [subcategory_id, category_id],
        (subcategoryError, subcategoryResults) => {
          if (subcategoryError) {
            console.error("Check subcategory error:", subcategoryError);

            return res.status(500).json({
              success: false,
              message: "Failed to check subcategory",
            });
          }

          if (subcategoryResults.length === 0) {
            return res.status(400).json({
              success: false,
              message: "Subcategory does not belong to the selected category",
            });
          }

          // CHECK DUPLICATE PRODUCT NAME IN SUBCATEGORY
          const duplicateQuery = `
            SELECT id
            FROM products
            WHERE category_id = ?
              AND subcategory_id = ?
              AND name = ?
            LIMIT 1
          `;

          connection.query(
            duplicateQuery,
            [category_id, subcategory_id, name.trim()],
            (duplicateError, duplicateResults) => {
              if (duplicateError) {
                console.error("Check duplicate product error:", duplicateError);

                return res.status(500).json({
                  success: false,
                  message: "Failed to check product",
                });
              }

              if (duplicateResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message:
                    "This product already exists in the selected subcategory",
                });
              }

              // INSERT PRODUCT
              const insertQuery = `
                INSERT INTO products
                (
                  category_id,
                  subcategory_id,
                  name,
                  description,
                
                  price,
                  image,
                  stock,
                  is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              connection.query(
                insertQuery,
                [
                  category_id,
                  subcategory_id,
                  name.trim(),
                  description || null,

                  Number(price),
                  image || null,
                  stockValue,
                  activeValue,
                ],
                (insertError, insertResult) => {
                  if (insertError) {
                    console.error("Add product error:", insertError);

                    return res.status(500).json({
                      success: false,
                      message: "Failed to add product",
                    });
                  }

                  return res.status(201).json({
                    success: true,
                    message: "Product added successfully",
                    product_id: insertResult.insertId,
                  });
                },
              );
            },
          );
        },
      );
    },
  );
}

// ============================================================
// EDIT PRODUCT
// ============================================================

function editAdminProduct(req, res) {
  console.log("Editing product...");

  const {
    id,
    category_id,
    subcategory_id,
    name,
    description,

    price,
    image,
    stock,
    is_active,
  } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  if (!category_id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  if (!subcategory_id) {
    return res.status(400).json({
      success: false,
      message: "Subcategory ID is required",
    });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product name is required",
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid product price is required",
    });
  }

  const stockValue = stock !== undefined ? Number(stock) : 0;

  if (!Number.isInteger(stockValue) || stockValue < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  const activeValue = is_active !== undefined ? Number(is_active) : 1;

  if (![0, 1].includes(activeValue)) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  // CHECK PRODUCT EXISTS
  const productQuery = `
    SELECT id
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(productQuery, [id], (productError, productResults) => {
    if (productError) {
      console.error("Check product error:", productError);

      return res.status(500).json({
        success: false,
        message: "Failed to check product",
      });
    }

    if (productResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // CHECK CATEGORY EXISTS
    const categoryQuery = `
        SELECT id
        FROM categories
        WHERE id = ?
        LIMIT 1
      `;

    connection.query(
      categoryQuery,
      [category_id],
      (categoryError, categoryResults) => {
        if (categoryError) {
          console.error("Check category error:", categoryError);

          return res.status(500).json({
            success: false,
            message: "Failed to check category",
          });
        }

        if (categoryResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }

        // CHECK SUBCATEGORY BELONGS TO SELECTED CATEGORY
        const subcategoryQuery = `
            SELECT id
            FROM subcategories
            WHERE id = ?
              AND category_id = ?
            LIMIT 1
          `;

        connection.query(
          subcategoryQuery,
          [subcategory_id, category_id],
          (subcategoryError, subcategoryResults) => {
            if (subcategoryError) {
              console.error("Check subcategory error:", subcategoryError);

              return res.status(500).json({
                success: false,
                message: "Failed to check subcategory",
              });
            }

            if (subcategoryResults.length === 0) {
              return res.status(400).json({
                success: false,
                message: "Subcategory does not belong to the selected category",
              });
            }

            // CHECK DUPLICATE PRODUCT NAME
            const duplicateQuery = `
                SELECT id
                FROM products
                WHERE category_id = ?
                  AND subcategory_id = ?
                  AND name = ?
                  AND id != ?
                LIMIT 1
              `;

            connection.query(
              duplicateQuery,
              [category_id, subcategory_id, name.trim(), id],
              (duplicateError, duplicateResults) => {
                if (duplicateError) {
                  console.error(
                    "Duplicate product check error:",
                    duplicateError,
                  );

                  return res.status(500).json({
                    success: false,
                    message: "Failed to check product name",
                  });
                }

                if (duplicateResults.length > 0) {
                  return res.status(409).json({
                    success: false,
                    message:
                      "Another product with this name already exists in the selected subcategory",
                  });
                }

                // UPDATE PRODUCT
                const updateQuery = `
                    UPDATE products
                    SET
                      category_id = ?,
                      subcategory_id = ?,
                      name = ?,
                      description = ?,
                      
                      price = ?,
                      image = ?,
                      stock = ?,
                      is_active = ?,
                      updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                  `;

                connection.query(
                  updateQuery,
                  [
                    category_id,
                    subcategory_id,
                    name.trim(),
                    description || null,

                    Number(price),
                    image || null,
                    stockValue,
                    activeValue,
                    id,
                  ],
                  (updateError) => {
                    if (updateError) {
                      console.error("Edit product error:", updateError);

                      return res.status(500).json({
                        success: false,
                        message: "Failed to edit product",
                      });
                    }

                    return res.status(200).json({
                      success: true,
                      message: "Product updated successfully",
                      product_id: id,
                    });
                  },
                );
              },
            );
          },
        );
      },
    );
  });
}

// ============================================================
// DELETE PRODUCT
// ============================================================

function removeProduct(req, res) {
  console.log("Removing product...");

  const { id } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  // CHECK PRODUCT EXISTS
  const checkQuery = `
    SELECT id
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check product error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check product",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // DELETE PRODUCT
    const deleteQuery = `
        DELETE FROM products
        WHERE id = ?
      `;

    connection.query(deleteQuery, [id], (deleteError) => {
      if (deleteError) {
        console.error("Delete product error:", deleteError);

        return res.status(500).json({
          success: false,
          message:
            "Failed to delete product. It may be referenced by existing carts, orders, or drives.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        product_id: id,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllProducts,
  addAdminProduct,
  editAdminProduct,
  removeProduct,
};
