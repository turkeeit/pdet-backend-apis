const connection = require("../config/dbconfig");

// ============================================================
// GET ALL SUBCATEGORIES
// ============================================================

function getAllSubcategories(req, res) {
  console.log("Getting all subcategories...");

  const query = `
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
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all subcategories error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get subcategories",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories: results,
    });
  });
}

// ============================================================
// ADD SUBCATEGORY
// ============================================================

function addSubcategory(req, res) {
  console.log("Adding subcategory...");

  const { category_id, name, image, is_active } = req.body;

  // VALIDATION
  if (!category_id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Subcategory name is required",
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

      // CHECK DUPLICATE SUBCATEGORY WITHIN CATEGORY
      const duplicateQuery = `
        SELECT id
        FROM subcategories
        WHERE category_id = ?
          AND name = ?
        LIMIT 1
      `;

      connection.query(
        duplicateQuery,
        [category_id, name.trim()],
        (duplicateError, duplicateResults) => {
          if (duplicateError) {
            console.error("Check duplicate subcategory error:", duplicateError);

            return res.status(500).json({
              success: false,
              message: "Failed to check subcategory",
            });
          }

          if (duplicateResults.length > 0) {
            return res.status(409).json({
              success: false,
              message:
                "This subcategory already exists in the selected category",
            });
          }

          // INSERT SUBCATEGORY
          const insertQuery = `
            INSERT INTO subcategories
            (
              category_id,
              name,
              image,
              is_active
            )
            VALUES (?, ?, ?, ?)
          `;

          connection.query(
            insertQuery,
            [category_id, name.trim(), image || null, activeValue],
            (insertError, insertResult) => {
              if (insertError) {
                console.error("Add subcategory error:", insertError);

                return res.status(500).json({
                  success: false,
                  message: "Failed to add subcategory",
                });
              }

              return res.status(201).json({
                success: true,
                message: "Subcategory added successfully",
                subcategory_id: insertResult.insertId,
              });
            },
          );
        },
      );
    },
  );
}

// ============================================================
// EDIT SUBCATEGORY
// ============================================================

function editSubcategory(req, res) {
  console.log("Editing subcategory...");

  const { id, category_id, name, image, is_active } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Subcategory ID is required",
    });
  }

  if (!category_id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Subcategory name is required",
    });
  }

  const activeValue = is_active !== undefined ? Number(is_active) : 1;

  if (![0, 1].includes(activeValue)) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  // CHECK SUBCATEGORY EXISTS
  const subcategoryQuery = `
    SELECT id
    FROM subcategories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(
    subcategoryQuery,
    [id],
    (subcategoryError, subcategoryResults) => {
      if (subcategoryError) {
        console.error("Check subcategory error:", subcategoryError);

        return res.status(500).json({
          success: false,
          message: "Failed to check subcategory",
        });
      }

      if (subcategoryResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
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

          // CHECK DUPLICATE NAME IN THE SELECTED CATEGORY
          const duplicateQuery = `
            SELECT id
            FROM subcategories
            WHERE category_id = ?
              AND name = ?
              AND id != ?
            LIMIT 1
          `;

          connection.query(
            duplicateQuery,
            [category_id, name.trim(), id],
            (duplicateError, duplicateResults) => {
              if (duplicateError) {
                console.error(
                  "Duplicate subcategory check error:",
                  duplicateError,
                );

                return res.status(500).json({
                  success: false,
                  message: "Failed to check subcategory name",
                });
              }

              if (duplicateResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message:
                    "Another subcategory with this name already exists in the selected category",
                });
              }

              // UPDATE SUBCATEGORY
              const updateQuery = `
                UPDATE subcategories
                SET
                  category_id = ?,
                  name = ?,
                  image = ?,
                  is_active = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `;

              connection.query(
                updateQuery,
                [category_id, name.trim(), image || null, activeValue, id],
                (updateError) => {
                  if (updateError) {
                    console.error("Edit subcategory error:", updateError);

                    return res.status(500).json({
                      success: false,
                      message: "Failed to edit subcategory",
                    });
                  }

                  return res.status(200).json({
                    success: true,
                    message: "Subcategory updated successfully",
                    subcategory_id: id,
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
// DELETE SUBCATEGORY
// ============================================================

function removeSubcategory(req, res) {
  console.log("Removing subcategory...");

  const { id } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Subcategory ID is required",
    });
  }

  // CHECK SUBCATEGORY EXISTS
  const checkQuery = `
    SELECT id
    FROM subcategories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check subcategory error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check subcategory",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // DELETE SUBCATEGORY
    const deleteQuery = `
      DELETE FROM subcategories
      WHERE id = ?
    `;

    connection.query(deleteQuery, [id], (deleteError) => {
      if (deleteError) {
        console.error("Delete subcategory error:", deleteError);

        return res.status(500).json({
          success: false,
          message:
            "Failed to delete subcategory. It may be referenced by existing products.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subcategory deleted successfully",
        subcategory_id: id,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllSubcategories,
  addSubcategory,
  editSubcategory,
  removeSubcategory,
};
