const connection = require("../config/dbconfig");

function getOrderDetails(req, res) {
  console.log("Fetching order details...");

  // User ID comes from JWT middleware
  const user_id = req.headers.user_id;

  const order_id = req.params.id;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  const orderQuery = `
    SELECT
      id,
      order_number,
      user_id,
      address_id,
      order_type,
      original_amount,
      final_amount,
      drive_saving,
      delivery_charge,
      total_amount,
      payment_method,
      payment_status,
      status,
      created_at,
      updated_at
    FROM orders
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
  `;

  connection.query(
    orderQuery,
    [order_id, user_id],
    (orderError, orderResults) => {
      if (orderError) {
        console.error("Error fetching order:", orderError);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch order",
        });
      }

      if (orderResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const order = orderResults[0];

      const itemsQuery = `
        SELECT
          id,
          order_id,
          vendor_id,
          product_id,
          drive_id,
          product_name,
          product_image,
          drive_title,
          price,
          quantity,
          total,
          created_at,
          updated_at
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
      `;

      connection.query(itemsQuery, [order_id], (itemsError, itemResults) => {
        if (itemsError) {
          console.error("Error fetching order items:", itemsError);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch order items",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Order details fetched successfully",

          order: {
            id: order.id,
            order_number: order.order_number,
            user_id: order.user_id,
            address_id: order.address_id,
            order_type: order.order_type,
            original_amount: order.original_amount,
            final_amount: order.final_amount,
            drive_saving: order.drive_saving,
            delivery_charge: order.delivery_charge,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at,

            items: itemResults,
          },
        });
      });
    },
  );
}

module.exports = getOrderDetails;
