const connection = require("../config/dbconfig");

function updateOrderPayment(req, res) {
  console.log("Updating order payment...");

  // User comes from JWT
  const user_id = req.headers.user_id;

  // Order ID comes from URL
  const order_id = req.params.id;

  const { payment_method, payment_status, status } = req.body;

  // =====================================================
  // VALIDATION
  // =====================================================

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  if (!payment_method) {
    return res.status(400).json({
      success: false,
      message: "Payment method is required",
    });
  }

  if (!payment_status) {
    return res.status(400).json({
      success: false,
      message: "Payment status is required",
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Order status is required",
    });
  }

  // =====================================================
  // ALLOWED VALUES
  // =====================================================

  const allowedPaymentMethods = ["cod", "online"];

  const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

  const allowedStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "REFUNDED",
  ];
  if (!allowedPaymentMethods.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  }

  if (!allowedPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment status",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  // =====================================================
  // CHECK ORDER BELONGS TO USER
  // =====================================================

  const checkOrderQuery = `
    SELECT
      id,
      order_number,
      user_id,
      payment_method,
      payment_status,
      status
    FROM orders
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
  `;

  connection.query(
    checkOrderQuery,
    [order_id, user_id],
    (checkError, results) => {
      if (checkError) {
        console.error("Error checking order:", checkError);

        return res.status(500).json({
          success: false,
          message: "Failed to check order",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const order = results[0];

      // =================================================
      // PREVENT UPDATING COMPLETED/CANCELLED ORDER
      // =================================================

      if (order.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cancelled order cannot be updated",
        });
      }

      if (order.status === "delivered") {
        return res.status(400).json({
          success: false,
          message: "Delivered order cannot be updated",
        });
      }

      // =================================================
      // UPDATE ORDER
      // =================================================

      const updateQuery = `
        UPDATE orders
        SET
          payment_method = ?,
          payment_status = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = ?
          AND user_id = ?
      `;

      const updateValues = [
        payment_method,
        payment_status,
        status,
        order_id,
        user_id,
      ];

      connection.query(
        updateQuery,
        updateValues,
        (updateError, updateResult) => {
          if (updateError) {
            console.error("Error updating order payment:", updateError);

            return res.status(500).json({
              success: false,
              message: "Failed to update order payment",
            });
          }

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Order could not be updated",
            });
          }

          // =================================================
          // SUCCESS
          // =================================================

          return res.status(200).json({
            success: true,
            message: "Order payment updated successfully",

            order: {
              id: order.id,
              order_number: order.order_number,
              user_id: order.user_id,
              payment_method: payment_method,
              payment_status: payment_status,
              status: status,
            },
          });
        },
      );
    },
  );
}

module.exports = updateOrderPayment;
