const connection = require("../config/dbconfig");

function createOrder(req, res) {
  console.log("Creating order...");

  // User ID comes from JWT middleware
  const user_id = req.headers.user_id;

  const {
    address_id,
    order_type,
    original_amount,
    final_amount,
    drive_saving,
    delivery_charge,
    total_amount,
    payment_method,
    payment_status,
    items,
  } = req.body;

  // Validate required fields
  if (!address_id) {
    return res.status(400).json({
      success: false,
      message: "Address is required",
    });
  }

  if (!order_type) {
    return res.status(400).json({
      success: false,
      message: "Order type is required",
    });
  }

  if (!payment_method) {
    return res.status(400).json({
      success: false,
      message: "Payment method is required",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order items are required",
    });
  }

  // Generate order number
  const order_number =
    "ORD" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  const orderQuery = `
    INSERT INTO orders (
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
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const orderValues = [
    order_number,
    user_id,
    address_id,
    order_type,
    original_amount || 0,
    final_amount || 0,
    drive_saving || 0,
    delivery_charge || 0,
    total_amount || 0,
    payment_method,
    payment_status || "pending",
    "placed",
  ];

  connection.beginTransaction((transactionError) => {
    if (transactionError) {
      console.error("Transaction error:", transactionError);

      return res.status(500).json({
        success: false,
        message: "Failed to start order transaction",
      });
    }

    connection.query(orderQuery, orderValues, (orderError, orderResult) => {
      if (orderError) {
        console.error("Create order error:", orderError);

        return connection.rollback(() => {
          res.status(500).json({
            success: false,
            message: "Failed to create order",
          });
        });
      }

      const order_id = orderResult.insertId;

      const orderItemQuery = `
          INSERT INTO order_items (
            order_id,
            vendor_id,
            product_id,
            drive_id,
            product_name,
            product_image,
            drive_title,
            price,
            quantity,
            total
          )
          VALUES ?
        `;

      const orderItems = items.map((item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);

        return [
          order_id,
          item.vendor_id || 1,
          item.product_id,
          item.drive_id || null,
          item.product_name || null,
          item.product_image || null,
          item.drive_title || null,
          price,
          quantity,
          price * quantity,
        ];
      });

      connection.query(orderItemQuery, [orderItems], (itemError) => {
        if (itemError) {
          console.error("Create order items error:", itemError);

          return connection.rollback(() => {
            res.status(500).json({
              success: false,
              message: "Failed to create order items",
            });
          });
        }

        connection.commit((commitError) => {
          if (commitError) {
            console.error("Order commit error:", commitError);

            return connection.rollback(() => {
              res.status(500).json({
                success: false,
                message: "Failed to complete order",
              });
            });
          }

          return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: {
              id: order_id,
              order_number: order_number,
              user_id: user_id,
              address_id: address_id,
              order_type: order_type,
              original_amount: original_amount || 0,
              final_amount: final_amount || 0,
              drive_saving: drive_saving || 0,
              delivery_charge: delivery_charge || 0,
              total_amount: total_amount || 0,
              payment_method: payment_method,
              payment_status: payment_status || "pending",
              status: "placed",
            },
          });
        });
      });
    });
  });
}

module.exports = createOrder;
