const connection = require("../config/dbconfig");

// ============================================================
// GET ALL USERS
// ============================================================

function getAllUsers(req, res) {
  console.log("Getting all users...");

  const query = `
    SELECT
      u.id,
      u.mobile,
      u.name,
      u.email,
      u.created_at,
      u.updated_at,

      a.id AS address_id,
      a.user_id AS address_user_id,
      a.full_name AS address_full_name,
      a.mobile AS address_mobile,
      a.address_line1,
      a.address_line2,
      a.city,
      a.state,
      a.pincode,
      a.landmark,
      a.is_default AS address_is_default,
      a.created_at AS address_created_at,
      a.updated_at AS address_updated_at

    FROM users u

    LEFT JOIN addresses a
      ON a.user_id = u.id
      AND a.is_default = 1

    ORDER BY u.id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Get all users error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get users",
      });
    }

    const users = results.map((row) => {
      let address = null;

      if (row.address_id) {
        address = {
          id: row.address_id,
          user_id: row.address_user_id,
          full_name: row.address_full_name,
          mobile: row.address_mobile,
          address_line1: row.address_line1,
          address_line2: row.address_line2,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          landmark: row.landmark,
          is_default: row.address_is_default,
          created_at: row.address_created_at,
          updated_at: row.address_updated_at,
        };
      }

      return {
        id: row.id,
        mobile: row.mobile,
        name: row.name,
        email: row.email,
        created_at: row.created_at,
        updated_at: row.updated_at,
        address: address,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: users,
    });
  });
}

// ============================================================
// ADD USER
// ============================================================

function addUser(req, res) {
  console.log("Adding user...");

  const { mobile, name, email, address } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  // ----------------------------------------------------------
  // CHECK IF USER ALREADY EXISTS
  // ----------------------------------------------------------

  const checkUserQuery = `
    SELECT id
    FROM users
    WHERE mobile = ?
    LIMIT 1
  `;

  connection.query(checkUserQuery, [mobile], (checkError, checkResults) => {
    if (checkError) {
      console.error("Check user error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Failed to check user",
      });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this mobile number already exists",
      });
    }

    // --------------------------------------------------------
    // INSERT USER
    // --------------------------------------------------------

    const insertUserQuery = `
        INSERT INTO users
        (
          mobile,
          name,
          email
        )
        VALUES (?, ?, ?)
      `;

    connection.query(
      insertUserQuery,
      [mobile, name || null, email || null],
      (userError, userResult) => {
        if (userError) {
          console.error("Add user error:", userError);

          return res.status(500).json({
            success: false,
            message: "Failed to add user",
          });
        }

        const userId = userResult.insertId;

        // ----------------------------------------------------
        // NO ADDRESS
        // ----------------------------------------------------

        if (!address) {
          return res.status(201).json({
            success: true,
            message: "User added successfully",
            user_id: userId,
          });
        }

        // ----------------------------------------------------
        // INSERT ADDRESS
        // ----------------------------------------------------

        const insertAddressQuery = `
            INSERT INTO addresses
            (
              user_id,
              full_name,
              mobile,
              address_line1,
              address_line2,
              city,
              state,
              pincode,
              landmark,
              is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

        connection.query(
          insertAddressQuery,
          [
            userId,
            address.full_name || name || "",
            address.mobile || mobile,
            address.address_line1 || "",
            address.address_line2 || null,
            address.city || null,
            address.state || null,
            address.pincode || null,
            address.landmark || null,
            address.is_default !== undefined ? address.is_default : 1,
          ],
          (addressError, addressResult) => {
            if (addressError) {
              console.error("Add address error:", addressError);

              // User was created but address failed.
              return res.status(500).json({
                success: false,
                message: "User created but failed to add address",
                user_id: userId,
              });
            }

            return res.status(201).json({
              success: true,
              message: "User added successfully",
              user_id: userId,
              address_id: addressResult.insertId,
            });
          },
        );
      },
    );
  });
}

// ============================================================
// EDIT USER
// ============================================================

function editUser(req, res) {
  console.log("Editing user...");

  const { id, mobile, name, email, address } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  // ----------------------------------------------------------
  // UPDATE USER
  // ----------------------------------------------------------

  const updateUserQuery = `
    UPDATE users
    SET
      mobile = ?,
      name = ?,
      email = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  connection.query(
    updateUserQuery,
    [mobile, name || null, email || null, id],
    (userError, userResult) => {
      if (userError) {
        console.error("Edit user error:", userError);

        return res.status(500).json({
          success: false,
          message: "Failed to edit user",
        });
      }

      if (userResult.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // --------------------------------------------------------
      // NO ADDRESS PROVIDED
      // --------------------------------------------------------

      if (!address) {
        return res.status(200).json({
          success: true,
          message: "User updated successfully",
        });
      }

      // --------------------------------------------------------
      // CHECK DEFAULT ADDRESS
      // --------------------------------------------------------

      const checkAddressQuery = `
        SELECT id
        FROM addresses
        WHERE user_id = ?
        AND is_default = 1
        LIMIT 1
      `;

      connection.query(
        checkAddressQuery,
        [id],
        (addressCheckError, addressResults) => {
          if (addressCheckError) {
            console.error("Check address error:", addressCheckError);

            return res.status(500).json({
              success: false,
              message: "User updated but failed to check address",
            });
          }

          // ------------------------------------------------------
          // EXISTING ADDRESS -> UPDATE
          // ------------------------------------------------------

          if (addressResults.length > 0) {
            const addressId = addressResults[0].id;

            const updateAddressQuery = `
              UPDATE addresses
              SET
                full_name = ?,
                mobile = ?,
                address_line1 = ?,
                address_line2 = ?,
                city = ?,
                state = ?,
                pincode = ?,
                landmark = ?,
                is_default = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;

            connection.query(
              updateAddressQuery,
              [
                address.full_name || name || "",
                address.mobile || mobile,
                address.address_line1 || "",
                address.address_line2 || null,
                address.city || null,
                address.state || null,
                address.pincode || null,
                address.landmark || null,
                address.is_default !== undefined ? address.is_default : 1,
                addressId,
              ],
              (addressUpdateError) => {
                if (addressUpdateError) {
                  console.error("Update address error:", addressUpdateError);

                  return res.status(500).json({
                    success: false,
                    message: "User updated but failed to update address",
                  });
                }

                return res.status(200).json({
                  success: true,
                  message: "User updated successfully",
                });
              },
            );

            return;
          }

          // ------------------------------------------------------
          // NO ADDRESS -> CREATE ADDRESS
          // ------------------------------------------------------

          const insertAddressQuery = `
            INSERT INTO addresses
            (
              user_id,
              full_name,
              mobile,
              address_line1,
              address_line2,
              city,
              state,
              pincode,
              landmark,
              is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          connection.query(
            insertAddressQuery,
            [
              id,
              address.full_name || name || "",
              address.mobile || mobile,
              address.address_line1 || "",
              address.address_line2 || null,
              address.city || null,
              address.state || null,
              address.pincode || null,
              address.landmark || null,
              address.is_default !== undefined ? address.is_default : 1,
            ],
            (addressInsertError, addressInsertResult) => {
              if (addressInsertError) {
                console.error("Insert address error:", addressInsertError);

                return res.status(500).json({
                  success: false,
                  message: "User updated but failed to create address",
                });
              }

              return res.status(200).json({
                success: true,
                message: "User updated successfully",
                address_id: addressInsertResult.insertId,
              });
            },
          );
        },
      );
    },
  );
}

// ============================================================
// DELETE USER
// ============================================================

function removeUser(req, res) {
  console.log("Removing user...");

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  // ----------------------------------------------------------
  // DELETE ADDRESSES FIRST
  // ----------------------------------------------------------

  const deleteAddressQuery = `
    DELETE FROM addresses
    WHERE user_id = ?
  `;

  connection.query(deleteAddressQuery, [id], (addressError, addressResult) => {
    if (addressError) {
      console.error("Delete user addresses error:", addressError);

      return res.status(500).json({
        success: false,
        message: "Failed to delete user addresses",
      });
    }

    // --------------------------------------------------------
    // DELETE USER
    // --------------------------------------------------------

    const deleteUserQuery = `
        DELETE FROM users
        WHERE id = ?
      `;

    connection.query(deleteUserQuery, [id], (userError, userResult) => {
      if (userError) {
        console.error("Delete user error:", userError);

        return res.status(500).json({
          success: false,
          message: "Failed to delete user",
        });
      }

      if (userResult.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user_id: id,
        addresses_removed: addressResult.affectedRows,
      });
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllUsers,
  addUser,
  editUser,
  removeUser,
};
