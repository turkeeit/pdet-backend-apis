const connection = require("../config/dbconfig");

function addToCart(req, res) {
  console.log("Adding item to cart...");

  const { product_id, drive_id, quantity } = req.body;
  const mobile_number = req.headers.mobile_number;

  // -----------------------------------------
  // VALIDATION
  // -----------------------------------------

  if (!mobile_number) {
    return res.status(401).json({
      message: "Mobile number is required",
    });
  }

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      message: "Quantity must be at least 1",
    });
  }

  // -----------------------------------------
  // GET USER
  // -----------------------------------------

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

    // -----------------------------------------
    // GET PRODUCT
    // -----------------------------------------

    const getProductQuery = `
        SELECT
          id,
          name,
          image,
          price,
          stock
        FROM products
        WHERE id = ?
        AND is_active = 1
        LIMIT 1
      `;

    connection.query(getProductQuery, [product_id], (productErr, products) => {
      if (productErr) {
        console.error("Error fetching product:", productErr);

        return res.status(500).json({
          message: "Server error while fetching product",
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const product = products[0];

      // -----------------------------------------
      // CHECK STOCK
      // -----------------------------------------

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      // -----------------------------------------
      // DRIVE PRODUCT
      // -----------------------------------------

      if (drive_id) {
        const getDriveQuery = `
              SELECT
                d.id,
                d.product_id,
                d.vendor_id,
                d.title,
                d.status
              FROM drives d
              WHERE d.id = ?
              AND d.product_id = ?
              AND d.status = 'ACTIVE'
              LIMIT 1
            `;

        connection.query(
          getDriveQuery,
          [drive_id, product_id],
          (driveErr, drives) => {
            if (driveErr) {
              console.error("Error fetching drive:", driveErr);

              return res.status(500).json({
                message: "Server error while fetching drive",
              });
            }

            if (drives.length === 0) {
              return res.status(404).json({
                message: "Active Drive not found for this product",
              });
            }

            const drive = drives[0];

            // -----------------------------------------
            // GET DRIVE PRICE
            // -----------------------------------------

            const getDrivePriceQuery = `
                  SELECT
                    minimum_participants,
                    price
                  FROM drive_price_tiers
                  WHERE drive_id = ?
                  ORDER BY minimum_participants ASC
                  LIMIT 1
                `;

            connection.query(
              getDrivePriceQuery,
              [drive.id],
              (priceErr, priceTiers) => {
                if (priceErr) {
                  console.error("Error fetching drive price:", priceErr);

                  return res.status(500).json({
                    message: "Server error while fetching drive price",
                  });
                }

                if (priceTiers.length === 0) {
                  return res.status(404).json({
                    message: "Drive price not available",
                  });
                }

                const drivePrice = priceTiers[0].price;

                addItemToCart(
                  userId,
                  product,
                  drive,
                  drivePrice,
                  quantity,
                  res,
                );
              },
            );
          },
        );
      } else {
        // -----------------------------------------
        // NORMAL PRODUCT
        // -----------------------------------------

        addItemToCart(userId, product, null, product.price, quantity, res);
      }
    });
  });
}

// =================================================
// ADD ITEM TO CART
// =================================================

function addItemToCart(userId, product, drive, finalPrice, quantity, res) {
  // -----------------------------------------
  // FIND USER CART
  // -----------------------------------------

  const getCartQuery = `
    SELECT id
    FROM carts
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(getCartQuery, [userId], (cartErr, carts) => {
    if (cartErr) {
      console.error("Error fetching cart:", cartErr);

      return res.status(500).json({
        message: "Server error while fetching cart",
      });
    }

    if (carts.length > 0) {
      addCartItem(carts[0].id, product, drive, finalPrice, quantity, res);
    } else {
      // -----------------------------------------
      // CREATE CART
      // -----------------------------------------

      const createCartQuery = `
          INSERT INTO carts (
            user_id
          )
          VALUES (?)
        `;

      connection.query(createCartQuery, [userId], (createErr, result) => {
        if (createErr) {
          console.error("Error creating cart:", createErr);

          return res.status(500).json({
            message: "Server error while creating cart",
          });
        }

        addCartItem(result.insertId, product, drive, finalPrice, quantity, res);
      });
    }
  });
}

// =================================================
// ADD / UPDATE CART ITEM
// =================================================

function addCartItem(cartId, product, drive, finalPrice, quantity, res) {
  const driveId = drive ? drive.id : null;
  const driveTitle = drive ? drive.title : null;

  // -----------------------------------------
  // CHECK EXISTING ITEM
  // -----------------------------------------

  let checkItemQuery;
  let checkParams;

  if (driveId) {
    // Drive item
    checkItemQuery = `
      SELECT
        id,
        quantity
      FROM cart_items
      WHERE cart_id = ?
      AND product_id = ?
      AND drive_id = ?
      LIMIT 1
    `;

    checkParams = [cartId, product.id, driveId];
  } else {
    // Normal product
    checkItemQuery = `
      SELECT
        id,
        quantity
      FROM cart_items
      WHERE cart_id = ?
      AND product_id = ?
      AND drive_id IS NULL
      LIMIT 1
    `;

    checkParams = [cartId, product.id];
  }

  connection.query(checkItemQuery, checkParams, (itemErr, items) => {
    if (itemErr) {
      console.error("Error checking cart item:", itemErr);

      return res.status(500).json({
        message: "Server error while checking cart item",
      });
    }

    // -----------------------------------------
    // ITEM ALREADY EXISTS
    // -----------------------------------------

    if (items.length > 0) {
      const newQuantity = items[0].quantity + quantity;

      const updateQuery = `
          UPDATE cart_items
          SET
            quantity = ?,
            price = ?,
            drive_title = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

      connection.query(
        updateQuery,
        [newQuantity, finalPrice, driveTitle, items[0].id],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating cart item:", updateErr);

            return res.status(500).json({
              message: "Server error while updating cart",
            });
          }

          return res.status(200).json({
            message: "Cart item quantity updated",
            cart_item_id: items[0].id,
            quantity: newQuantity,
            price: finalPrice,
          });
        },
      );

      return;
    }

    // -----------------------------------------
    // NEW CART ITEM
    // -----------------------------------------

    const insertQuery = `
        INSERT INTO cart_items (
          cart_id,
          product_id,
          drive_id,
          product_name,
          product_image,
          drive_title,
          price,
          quantity
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

    connection.query(
      insertQuery,
      [
        cartId,
        product.id,
        driveId,
        product.name,
        product.image,
        driveTitle,
        finalPrice,
        quantity,
      ],
      (insertErr, result) => {
        if (insertErr) {
          console.error("Error adding cart item:", insertErr);

          return res.status(500).json({
            message: "Server error while adding item to cart",
          });
        }

        return res.status(200).json({
          message: "Item added to cart successfully",
          cart_item_id: result.insertId,
          product_id: product.id,
          drive_id: driveId,
          drive_title: driveTitle,
          price: finalPrice,
          quantity: quantity,
        });
      },
    );
  });
}

module.exports = addToCart;
