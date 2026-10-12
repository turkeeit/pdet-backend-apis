const connection = require("../config/dbconfig");

function removeCartItem(req, res) {
  console.log("Removing cart item...");

  const { cart_item_id } = req.body;
  const mobile_number = req.headers.mobile_number;

  if (!mobile_number) {
    return res.status(401).json({
      message: "Mobile number is required",
    });
  }

  if (!cart_item_id) {
    return res.status(400).json({
      message: "Cart item ID is required",
    });
  }

  const getUserQuery = `
    SELECT id
    FROM users
    WHERE mobile = ?
    LIMIT 1
  `;

  connection.query(getUserQuery, [mobile_number], (userErr, users) => {
    if (userErr) {
      console.error("Error fetching user:", userErr);

      return res.status(500).json({
        message: "Server error while fetching user",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userId = users[0].id;

    const deleteQuery = `
        DELETE ci
        FROM cart_items ci
        INNER JOIN carts c
          ON ci.cart_id = c.id
        WHERE ci.id = ?
        AND c.user_id = ?
      `;

    connection.query(
      deleteQuery,
      [cart_item_id, userId],
      (deleteErr, result) => {
        if (deleteErr) {
          console.error("Error removing cart item:", deleteErr);

          return res.status(500).json({
            message: "Server error while removing cart item",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Cart item not found",
          });
        }

        return res.status(200).json({
          message: "Item removed from cart successfully",
          cart_item_id: cart_item_id,
        });
      },
    );
  });
}

module.exports = removeCartItem;
