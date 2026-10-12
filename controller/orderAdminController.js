const connection = require("../config/dbconfig");

// ============================================================
// GET ALL ORDERS
// ============================================================

function getAdminAllOrders(req, res) {
  console.log("Getting all orders...");

  const query = `
    SELECT
      o.*
    FROM orders o
    ORDER BY o.id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all orders error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get orders",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: results,
    });
  });
}

// ============================================================
// ADD ORDER
// ============================================================

function addAdminOrder(req, res) {
  console.log("Adding order...");

  const {
    user_id,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    shipping_address,
  } = req.body;

  // VALIDATION
  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (
    total_amount === undefined ||
    total_amount === null ||
    total_amount === "" ||
    !Number.isFinite(Number(total_amount)) ||
    Number(total_amount) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid total amount is required",
    });
  }

  if (!payment_method || !payment_method.trim()) {
    return res.status(400).json({
      success: false,
      message: "Payment method is required",
    });
  }

  if (!order_status || !order_status.trim()) {
    return res.status(400).json({
      success: false,
      message: "Order status is required",
    });
  }

  // CHECK USER EXISTS
  const userQuery = `
    SELECT id
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(userQuery, [user_id], (userError, userResults) => {
    if (userError) {
      console.error("Check user error:", userError);

      return res.status(500).json({
        success: false,
        message: "Failed to check user",
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // INSERT ORDER
    const insertQuery = `
        INSERT INTO orders
        (
          user_id,
          total_amount,
          payment_method,
          payment_status,
          order_status,
          shipping_address
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

    connection.query(
      insertQuery,
      [
        user_id,
        Number(total_amount),
        payment_method.trim(),
        payment_status || "pending",
        order_status.trim(),
        shipping_address || null,
      ],
      (insertError, insertResult) => {
        if (insertError) {
          console.error("Add order error:", insertError);

          return res.status(500).json({
            success: false,
            message: "Failed to add order",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Order added successfully",
          order_id: insertResult.insertId,
        });
      },
    );
  });
}

// ============================================================
// EDIT ORDER
// ============================================================

function editAdminOrder(req, res) {
  console.log("Editing order...");

  const {
    id,
    user_id,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    shipping_address,
  } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (
    total_amount === undefined ||
    total_amount === null ||
    total_amount === "" ||
    !Number.isFinite(Number(total_amount)) ||
    Number(total_amount) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid total amount is required",
    });
  }

  if (!payment_method || !payment_method.trim()) {
    return res.status(400).json({
      success: false,
      message: "Payment method is required",
    });
  }

  if (!order_status || !order_status.trim()) {
    return res.status(400).json({
      success: false,
      message: "Order status is required",
    });
  }

  // CHECK ORDER EXISTS
  const orderQuery = `
    SELECT id
    FROM orders
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(orderQuery, [id], (orderError, orderResults) => {
    if (orderError) {
      console.error("Check order error:", orderError);

      return res.status(500).json({
        success: false,
        message: "Failed to check order",
      });
    }

    if (orderResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // CHECK USER EXISTS
    const userQuery = `
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
      `;

    connection.query(userQuery, [user_id], (userError, userResults) => {
      if (userError) {
        console.error("Check user error:", userError);

        return res.status(500).json({
          success: false,
          message: "Failed to check user",
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // UPDATE ORDER
      const updateQuery = `
            UPDATE orders
            SET
              user_id = ?,
              total_amount = ?,
              payment_method = ?,
              payment_status = ?,
              order_status = ?,
              shipping_address = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;

      connection.query(
        updateQuery,
        [
          user_id,
          Number(total_amount),
          payment_method.trim(),
          payment_status || "pending",
          order_status.trim(),
          shipping_address || null,
          id,
        ],
        (updateError) => {
          if (updateError) {
            console.error("Edit order error:", updateError);

            return res.status(500).json({
              success: false,
              message: "Failed to edit order",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order_id: id,
          });
        },
      );
    });
  });
}

// ============================================================
// DELETE ORDER
// ============================================================

function removeAdminOrder(req, res) {
  console.log("Removing order...");

  const { id } = req.body;

  // VALIDATION
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  // CHECK ORDER EXISTS
  const checkQuery = `
    SELECT id
    FROM orders
    WHERE id = ?
    LIMIT 1
  `;

  connection.query(checkQuery, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check order error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check order",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // DELETE ORDER
    const deleteQuery = `
        DELETE FROM orders
        WHERE id = ?
      `;

    connection.query(deleteQuery, [id], (deleteError) => {
      if (deleteError) {
        console.error("Delete order error:", deleteError);

        return res.status(500).json({
          success: false,
          message:
            "Failed to delete order. It may be referenced by order items or payment records.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
        order_id: id,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAdminAllOrders,
  addAdminOrder,
  editAdminOrder,
  removeAdminOrder,
};
