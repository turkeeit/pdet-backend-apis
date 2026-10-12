const connection = require("../config/dbconfig");

// ============================================================
// GET ALL CATEGORIES
// ============================================================

function getAllCategories(req, res) {
  console.log("Getting all categories...");

  const query = `
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

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all categories error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get categories",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: results,
    });
  });
}

// ============================================================
// ADD CATEGORY
// ============================================================

function addCategory(req, res) {
  console.log("Adding category...");

  const { name, image, is_active } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Category name is required",
    });
  }

  // ----------------------------------------------------------
  // CHECK DUPLICATE CATEGORY
  // ----------------------------------------------------------

  const checkQuery = `
    SELECT id
    FROM categories
    WHERE name = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [name.trim()], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check category error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check category",
      });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // --------------------------------------------------------
    // INSERT CATEGORY
    // --------------------------------------------------------

    const insertQuery = `
        INSERT INTO categories
        (
          name,
          image,
          is_active
        )
        VALUES (?, ?, ?)
      `;

    connection.query(
      insertQuery,
      [name.trim(), image || null, is_active !== undefined ? is_active : 1],
      (insertError, insertResult) => {
        if (insertError) {
          console.error("Add category error:", insertError);

          return res.status(500).json({
            success: false,
            message: "Failed to add category",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Category added successfully",
          category_id: insertResult.insertId,
        });
      },
    );
  });
}

// ============================================================
// EDIT CATEGORY
// ============================================================

function editCategory(req, res) {
  console.log("Editing category...");

  const { id, name, image, is_active } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Category name is required",
    });
  }

  // ----------------------------------------------------------
  // CHECK CATEGORY EXISTS
  // ----------------------------------------------------------

  const checkQuery = `
    SELECT id
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check category error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check category",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // --------------------------------------------------------
    // CHECK DUPLICATE NAME
    // --------------------------------------------------------

    const duplicateQuery = `
        SELECT id
        FROM categories
        WHERE name = ?
        AND id != ?
        LIMIT 1
      `;

    connection.query(
      duplicateQuery,
      [name.trim(), id],
      (duplicateError, duplicateResults) => {
        if (duplicateError) {
          console.error("Duplicate category check error:", duplicateError);

          return res.status(500).json({
            success: false,
            message: "Failed to check category name",
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Another category with this name already exists",
          });
        }

        // ------------------------------------------------------
        // UPDATE CATEGORY
        // ------------------------------------------------------

        const updateQuery = `
            UPDATE categories
            SET
              name = ?,
              image = ?,
              is_active = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;

        connection.query(
          updateQuery,
          [
            name.trim(),
            image || null,
            is_active !== undefined ? is_active : 1,
            id,
          ],
          (updateError, updateResult) => {
            if (updateError) {
              console.error("Edit category error:", updateError);

              return res.status(500).json({
                success: false,
                message: "Failed to edit category",
              });
            }

            return res.status(200).json({
              success: true,
              message: "Category updated successfully",
              category_id: id,
            });
          },
        );
      },
    );
  });
}

// ============================================================
// DELETE CATEGORY
// ============================================================

function removeCategory(req, res) {
  console.log("Removing category...");

  const { id } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  // ----------------------------------------------------------
  // CHECK CATEGORY EXISTS
  // ----------------------------------------------------------

  const checkQuery = `
    SELECT id
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check category error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check category",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // --------------------------------------------------------
    // DELETE CATEGORY
    // --------------------------------------------------------

    const deleteQuery = `
        DELETE FROM categories
        WHERE id = ?
      `;

    connection.query(deleteQuery, [id], (deleteError, deleteResult) => {
      if (deleteError) {
        console.error("Delete category error:", deleteError);

        return res.status(500).json({
          success: false,
          message: "Failed to delete category",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        category_id: id,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllCategories,
  addCategory,
  editCategory,
  removeCategory,
};
