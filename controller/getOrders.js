const connection = require("../config/dbconfig");

function getOrders(req, res) {
  console.log("Fetching user orders...");

  // User ID comes from JWT middleware
  const user_id = req.headers.user_id;

  const query = `
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
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  connection.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: results,
    });
  });
}

module.exports = getOrders;
