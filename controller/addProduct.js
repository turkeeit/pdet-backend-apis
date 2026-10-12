const connection = require("../config/dbconfig");
const fs = require("fs");
const path = require("path");

function addProduct(req, res) {
  console.log("Adding product...");

  const {
    category_id,
    subcategory_id,
    name,
    description,
    price,
    stock,
    is_active,
  } = req.body;

  // Multer stores the uploaded image in uploads/products.
  const image = req.file ? `/uploads/products/${req.file.filename}` : null;

  // Remove uploaded image if validation or database operations fail.
  function cleanupUploadedFile() {
    if (!req.file) return;

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      req.file.filename,
    );

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to remove uploaded image:", err.message);
      }
    });
  }

  function fail(statusCode, message) {
    cleanupUploadedFile();

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // -----------------------------
  // Validate request fields
  // -----------------------------

  if (!category_id || !Number.isInteger(Number(category_id))) {
    return fail(400, "A valid category ID is required");
  }

  if (!subcategory_id || !Number.isInteger(Number(subcategory_id))) {
    return fail(400, "A valid subcategory ID is required");
  }

  if (typeof name !== "string" || !name.trim()) {
    return fail(400, "Product name is required");
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return fail(400, "A valid price is required");
  }

  const productStock = stock === undefined || stock === "" ? 0 : Number(stock);

  if (!Number.isInteger(productStock) || productStock < 0) {
    return fail(400, "Stock must be a non-negative integer");
  }

  const activeValue =
    is_active === undefined || is_active === "" ? 1 : Number(is_active);

  if (![0, 1].includes(activeValue)) {
    return fail(400, "is_active must be 0 or 1");
  }

  // -----------------------------
  // Check category exists
  // -----------------------------

  const checkCategoryQuery = `
    SELECT id
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(
    checkCategoryQuery,
    [Number(category_id)],
    (err, categoryResult) => {
      if (err) {
        console.error("Error checking category:", err);
        return fail(500, "Server error while checking category");
      }

      if (!categoryResult || categoryResult.length === 0) {
        return fail(404, "Category not found");
      }

      // -----------------------------
      // Check subcategory belongs to category
      // -----------------------------

      const checkSubcategoryQuery = `
        SELECT id
        FROM subcategories
        WHERE id = ?
          AND category_id = ?
        LIMIT 1
      `;

      connection.query(
        checkSubcategoryQuery,
        [Number(subcategory_id), Number(category_id)],
        (err, subcategoryResult) => {
          if (err) {
            console.error("Error checking subcategory:", err);
            return fail(500, "Server error while checking subcategory");
          }

          if (!subcategoryResult || subcategoryResult.length === 0) {
            return fail(
              404,
              "Subcategory not found or does not belong to this category",
            );
          }

          // -----------------------------
          // Insert product
          // 8 columns = 8 placeholders = 8 values
          // -----------------------------

          const addProductQuery = `
            INSERT INTO products (
              category_id,
              subcategory_id,
              name,
              description,
              price,
              image,
              stock,
              is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            Number(category_id),
            Number(subcategory_id),
            name.trim(),
            description ? description.trim() || null : null,
            Number(price),
            image,
            productStock,
            activeValue,
          ];

          connection.query(addProductQuery, values, (err, result) => {
            if (err) {
              console.error("Error adding product:", err);
              return fail(500, "Server error while adding product");
            }

            const baseUrl = `${req.protocol}://${req.get("host")}`;

            return res.status(201).json({
              success: true,
              message: "Product added successfully",
              product: {
                id: result.insertId,
                category_id: Number(category_id),
                subcategory_id: Number(subcategory_id),
                name: name.trim(),
                description: description ? description.trim() || null : null,
                price: Number(price),
                image: image ? `${image}` : null,
                stock: productStock,
                is_active: activeValue,
              },
            });
          });
        },
      );
    },
  );
}

module.exports = addProduct;
