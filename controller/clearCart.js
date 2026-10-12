const connection = require("../config/dbconfig");

function clearCart(req, res) {
  console.log("Clearing cart...");

  // User identity comes from JWT middleware.
  const user_id = req.headers.user_id;

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // ============================================================
  // FIND USER CART
  // ============================================================

  const getCartQuery = `
    SELECT id
    FROM carts
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(getCartQuery, [user_id], (cartError, cartResults) => {
    if (cartError) {
      console.error("Get cart error:", cartError);

      return res.status(500).json({
        success: false,
        message: "Failed to find cart",
      });
    }

    // No cart exists.
    // Treat this as successfully cleared.
    if (cartResults.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    const cart_id = cartResults[0].id;

    // ========================================================
    // DELETE CART ITEMS
    // ========================================================

    const deleteItemsQuery = `
        DELETE FROM cart_items
        WHERE cart_id = ?
      `;

    connection.query(
      deleteItemsQuery,
      [cart_id],
      (deleteError, deleteResult) => {
        if (deleteError) {
          console.error("Clear cart items error:", deleteError);

          return res.status(500).json({
            success: false,
            message: "Failed to clear cart",
          });
        }

        console.log(
          "Cart cleared successfully.",
          "User ID:",
          user_id,
          "Cart ID:",
          cart_id,
          "Items removed:",
          deleteResult.affectedRows,
        );

        return res.status(200).json({
          success: true,
          message: "Cart cleared successfully",
          cart_id: cart_id,
          items_removed: deleteResult.affectedRows,
        });
      },
    );
  });
}

module.exports = clearCart;
