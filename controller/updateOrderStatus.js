const connection = require("../config/dbconfig");

function updateOrderStatus(req, res) {
  const user_id = req.headers.user_id;
  const order_id = req.params.id;
  const { status } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  if (!status || typeof status !== "string") {
    return res.status(400).json({
      success: false,
      message: "Order status is required",
    });
  }

  const normalizedStatus = status.trim().toLowerCase();

  // Statuses this API allows the client to request.
  const allowedStatuses = ["cancelled"];

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Allowed status: cancelled",
    });
  }

  const getOrderQuery = `
    SELECT id, user_id, status
    FROM orders
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  connection.query(getOrderQuery, [order_id, user_id], (findError, results) => {
    if (findError) {
      console.error("Error finding order:", findError);

      return res.status(500).json({
        success: false,
        message: "Failed to find order",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = results[0];
    const currentStatus = String(order.status || "")
      .trim()
      .toLowerCase();

    // Prevent cancellation of orders that are no longer cancellable.
    const cancellableStatuses = [
      "pending",
      "confirmed",
      "placed",
      "processing",
    ];

    if (!cancellableStatuses.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled when its status is '${order.status}'`,
      });
    }

    const updateQuery = `
        UPDATE orders
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

    connection.query(
      updateQuery,
      [normalizedStatus, order_id, user_id],
      (updateError, updateResult) => {
        if (updateError) {
          console.error("Error updating order status:", updateError);

          return res.status(500).json({
            success: false,
            message: "Failed to update order status",
          });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(409).json({
            success: false,
            message: "Order status was not updated",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Order cancelled successfully",
          order: {
            id: order.id,
            status: normalizedStatus,
          },
        });
      },
    );
  });
}

module.exports = updateOrderStatus;
