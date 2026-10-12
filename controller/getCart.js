const connection = require("../config/dbconfig");

function getCart(req, res) {
  console.log("========================================");
  console.log("GET CART API");
  console.log("========================================");

  const mobile_number = req.headers.mobile_number;

  // ============================================================
  // VALIDATION
  // ============================================================

  if (!mobile_number) {
    return res.status(401).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  const mobile = mobile_number.toString().trim();

  if (mobile.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  console.log("Mobile:", mobile);

  // ============================================================
  // GET USER
  // ============================================================

  const getUserQuery = `
    SELECT id, mobile
    FROM users
    WHERE mobile = ?
    LIMIT 1
  `;

  connection.query(getUserQuery, [mobile], (userErr, users) => {
    if (userErr) {
      console.error("GET USER ERROR:", userErr);

      return res.status(500).json({
        success: false,
        message: "Server error while fetching user",
      });
    }

    if (!users || users.length === 0) {
      console.log("User not found");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = users[0].id;

    console.log("User ID:", userId);

    // ============================================================
    // GET CART
    // ============================================================

    const getCartQuery = `
      SELECT id, user_id, created_at, updated_at
      FROM carts
      WHERE user_id = ?
      LIMIT 1
    `;

    connection.query(getCartQuery, [userId], (cartErr, carts) => {
      if (cartErr) {
        console.error("GET CART ERROR:", cartErr);

        return res.status(500).json({
          success: false,
          message: "Server error while fetching cart",
        });
      }

      // ============================================================
      // CART DOES NOT EXIST
      // ============================================================

      if (!carts || carts.length === 0) {
        console.log("Cart does not exist");

        return res.status(200).json({
          success: true,
          message: "Cart is empty",
          cart_id: null,
          total_items: 0,
          total_amount: 0,
          items: [],
        });
      }

      const cartId = carts[0].id;

      console.log("Cart ID:", cartId);

      // ============================================================
      // GET CART ITEMS
      // ============================================================

      const getItemsQuery = `
        SELECT

          /* CART ITEM */
          ci.id,
          ci.cart_id,
          ci.product_id,
          ci.drive_id,

          ci.product_name,
          ci.product_image,

          ci.drive_title,

          ci.price,
          ci.quantity,

          ci.created_at,
          ci.updated_at,

          /* DRIVE */
          d.vendor_id AS drive_vendor_id,
          d.status AS drive_status,
          d.start_date AS drive_start_date,
          d.end_date AS drive_end_date,

          d.minimum_participants,
          d.maximum_participants,
          d.current_participants,

          /* VENDOR */
          v.name AS seller_name,
          v.mobile AS seller_mobile,
          v.email AS seller_email

        FROM cart_items ci

        LEFT JOIN drives d
          ON ci.drive_id = d.id

        LEFT JOIN vendors v
          ON d.vendor_id = v.id

        WHERE ci.cart_id = ?

        ORDER BY ci.id DESC
      `;

      connection.query(getItemsQuery, [cartId], (itemErr, items) => {
        if (itemErr) {
          console.error("GET CART ITEMS ERROR:", itemErr);

          return res.status(500).json({
            success: false,
            message: "Server error while fetching cart items",
          });
        }

        // ======================================================
        // CART EXISTS BUT NO ITEMS
        // ======================================================

        if (!items || items.length === 0) {
          console.log("Cart exists but has no items");

          return res.status(200).json({
            success: true,
            message: "Cart is empty",
            cart_id: cartId,
            total_items: 0,
            total_amount: 0,
            items: [],
          });
        }

        // ======================================================
        // NORMALIZE ITEMS
        // ======================================================

        const formattedItems = items.map((item) => {
          return {
            id: item.id,

            cart_id: item.cart_id,

            product_id: item.product_id,

            drive_id: item.drive_id,

            product_name: item.product_name || "",

            product_image: item.product_image || "",

            drive_title: item.drive_title || null,

            price: Number(parseFloat(item.price || 0).toFixed(2)),

            quantity: parseInt(item.quantity || 0),

            created_at: item.created_at,

            updated_at: item.updated_at,

            // ----------------------------------------------
            // DRIVE
            // ----------------------------------------------

            drive_vendor_id: item.drive_vendor_id || null,

            drive_status: item.drive_status || null,

            drive_start_date: item.drive_start_date || null,

            drive_end_date: item.drive_end_date || null,

            minimum_participants:
              item.minimum_participants != null
                ? Number(item.minimum_participants)
                : null,

            maximum_participants:
              item.maximum_participants != null
                ? Number(item.maximum_participants)
                : null,

            current_participants:
              item.current_participants != null
                ? Number(item.current_participants)
                : null,

            // ----------------------------------------------
            // SELLER
            // ----------------------------------------------

            seller_name: item.seller_name || null,

            seller_mobile: item.seller_mobile || null,

            seller_email: item.seller_email || null,
          };
        });

        // ======================================================
        // CALCULATE TOTALS
        // ======================================================

        let totalItems = 0;
        let totalAmount = 0;

        formattedItems.forEach((item) => {
          const quantity = Number(item.quantity) || 0;

          const price = Number(item.price) || 0;

          totalItems += quantity;

          totalAmount += price * quantity;
        });

        totalAmount = Number(totalAmount.toFixed(2));

        console.log("Total Items:", totalItems);
        console.log("Total Amount:", totalAmount);

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
          success: true,

          message: "Cart fetched successfully",

          cart_id: cartId,

          total_items: totalItems,

          total_amount: totalAmount,

          items: formattedItems,
        });
      });
    });
  });
}

module.exports = getCart;
