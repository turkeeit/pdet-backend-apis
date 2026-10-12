require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./config/dbconfig");
const sendOtp = require("./controller/sendOtp");
const loginController = require("./controller/loginController");
const getUserDetails = require("./controller/getUserDetails");
const VerifyJWT = require("./middleware/verifyJWT");
const updateProfile = require("./controller/updateProfile");
const addAddress = require("./controller/addAddress");
const editAddress = require("./controller/editAddress");
const getAddress = require("./controller/getAddress");
// const addCategory = require("./controller/addCategory");
// const editCategory = require("./controller/editCategory");
const getCategories = require("./controller/getCategories");
// const addSubcategory = require("./controller/addSubcategory");
// const editSubcategory = require("./controller/editSubcategory");
const getSubcategories = require("./controller/getSubcategories");
const addProduct = require("./controller/addProduct");
const editProduct = require("./controller/editProduct");
const getProductDetails = require("./controller/getProductDetails");
const createDrive = require("./controller/createDrive");
const createVendor = require("./controller/createVendor");
const updateDrive = require("./controller/updateDrive");
const getDriveDetails = require("./controller/getDriveDetails");
const addToCart = require("./controller/addToCart");
const getProductsByCategory = require("./controller/getProductsByCategory");
const getAllDrives = require("./controller/getAllDrives");
const getCart = require("./controller/getCart");
const getDrivesByProduct = require("./controller/getDrivesByProduct");
const removeCartItem = require("./controller/removeCartItem");
const createOrder = require("./controller/createOrder");
const getOrders = require("./controller/getOrders");
const getOrderDetails = require("./controller/getOrderDetails");
const updateOrderPayment = require("./controller/updateOrderPayment");
const clearCart = require("./controller/clearCart");
const updateOrderStatus = require("./controller/updateOrderStatus");
const {
  getAllUsers,
  addUser,
  editUser,
  removeUser,
} = require("./controller/userAdminController");
const {
  getAllCategories,
  addCategory,
  editCategory,
  removeCategory,
} = require("./controller/categoryAdminController");

const {
  getAllSubcategories,
  addSubcategory,
  editSubcategory,
  removeSubcategory,
} = require("./controller/subcategoryAdminController");

const {
  getAllProducts,
  addAdminProduct,
  editAdminProduct,
  removeProduct,
} = require("./controller/productAdminController");

const {
  getAdminAllDrives,
  addDrive,
  editDrive,
  removeDrive,
} = require("./controller/driveAdminController");

const {
  getAdminAllOrders,
  addAdminOrder,
  editAdminOrder,
  removeAdminOrder,
} = require("./controller/orderAdminController");

const {
  getAllVendors,
  addVendor,
  editVendor,
  removeVendor,
} = require("./controller/vendorAdminController");

const upload = require("./config/multer");
const path = require("path");
const app = express();

app.use(cors());

app.use(express.json());

const fs = require("fs");

const uploadsPath = path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadsPath));

console.log("Uploads directory:", uploadsPath);
console.log("Uploads directory exists:", fs.existsSync(uploadsPath));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/pdet/health", (req, res) => {
  res.json({
    success: true,
    message: "Drive Commerce API is running",
  });
});

app.post("/api/pdet/sendOtp", sendOtp);
app.post(
  "/api/pdet/verifyOtp",
  async (req, res, next) => {
    console.log(req.headers);
    const otp = req.headers.otp;
    console.log("otp", otp);
    const mobile_number = req.headers.mobilenumber;

    let storedOtp;
    //get otp from database;

    let query = `SELECT otp FROM user_otps 
             WHERE mobile='${mobile_number}' 
              ORDER BY id DESC 
             LIMIT 1`;
    await connection.query(query, function (err, results) {
      if (err) {
        console.log("error in query execution", err);
        return;
      }
      console.log("select query executed", results[0].otp);
      storedOtp = results[0].otp;
      console.log("storeOtp", storedOtp);
      if (storedOtp && storedOtp == otp) {
        next();
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    });
  },
  loginController,
);

//routes
app.get("/api/pdet/getUserDetails", VerifyJWT, getUserDetails);
app.put("/api/pdet/updateUserProfile", VerifyJWT, updateProfile);
app.post("/api/pdet/addAddress", VerifyJWT, addAddress);
app.put("/api/pdet/editAddress", VerifyJWT, editAddress);
app.get("/api/pdet/getAddress", VerifyJWT, getAddress);
// app.post("/api/pdet/addCategory", VerifyJWT, addCategory);
// app.put("/api/pdet/editCategory", VerifyJWT, editCategory);
app.get("/api/pdet/getCategories", VerifyJWT, getCategories);
// app.post("/api/pdet/addSubcategory", VerifyJWT, addSubcategory);
// app.put("/api/pdet/editSubcategory", VerifyJWT, editSubcategory);
app.get("/api/pdet/getSubcategories", VerifyJWT, getSubcategories);
app.post("/api/pdet/addProduct", upload.single("image"), addProduct);
app.put("/api/pdet/editProduct/:id", VerifyJWT, editProduct);
app.get("/api/pdet/getProductDetails/:id", VerifyJWT, getProductDetails);
app.post("/api/pdet/createDrive", VerifyJWT, createDrive);
app.post("/api/pdet/createVendor", VerifyJWT, createVendor);
app.put("/api/pdet/updateDrive/:id", VerifyJWT, updateDrive);
app.get("/api/pdet/getDriveDetails/:id", VerifyJWT, getDriveDetails);
app.post("/api/pdet/addToCart", VerifyJWT, addToCart);
app.put("/api/pdet/updateOrderStatus/:id", VerifyJWT, updateOrderStatus);
app.get(
  "/api/pdet/products/category/:category_id",
  VerifyJWT,
  getProductsByCategory,
);
app.get("/api/pdet/getAllDrives", VerifyJWT, getAllDrives);
app.get("/api/pdet/getCart", VerifyJWT, getCart);
app.get(
  "/api/pdet/getDrivesByProduct/:product_id",
  VerifyJWT,
  getDrivesByProduct,
);
app.delete("/api/pdet/removeCartItem", VerifyJWT, removeCartItem);
app.post("/api/pdet/createOrder", VerifyJWT, createOrder);
app.get("/api/pdet/getOrders", VerifyJWT, getOrders);
app.get("/api/pdet/getOrderDetails/:id", VerifyJWT, getOrderDetails);
app.put("/api/pdet/updateOrderPayment/:id", VerifyJWT, updateOrderPayment);
app.delete("/api/pdet/clearCart", VerifyJWT, clearCart);

//pdet admin panel routes
app.get("/api/admin/pdet/getAllUsers", getAllUsers);
app.post("/api/admin/pdet/addUser", addUser);
app.put("/api/admin/pdet/editUser", editUser);
app.delete("/api/admin/pdet/removeUser", removeUser);

app.get("/api/admin/pdet/getAllCategories", getAllCategories);
app.post("/api/admin/pdet/addCategory", addCategory);
app.put("/api/admin/pdet/editCategory", editCategory);
app.delete("/api/admin/pdet/removeCategory", removeCategory);

app.get("/api/admin/pdet/getAllSubcategories", getAllSubcategories);
app.post("/api/admin/pdet/addSubcategory", addSubcategory);
app.put("/api/admin/pdet/editSubcategory", editSubcategory);
app.delete("/api/admin/pdet/removeSubcategory", removeSubcategory);

app.get("/api/admin/pdet/getAllProducts", getAllProducts);
app.post("/api/admin/pdet/addProduct", addAdminProduct);
app.put("/api/admin/pdet/editProduct", editAdminProduct);
app.delete("/api/admin/pdet/removeProduct", removeProduct);

app.get("/api/admin/pdet/getAllDrives", getAdminAllDrives);
app.post("/api/admin/pdet/addDrive", addDrive);
app.put("/api/admin/pdet/editDrive", editDrive);
app.delete("/api/admin/pdet/removeDrive", removeDrive);

app.get("/api/admin/pdet/getAllOrders", getAdminAllOrders);
app.post("/api/admin/pdet/addOrder", addAdminOrder);
app.put("/api/admin/pdet/editOrder", editAdminOrder);
app.delete("/api/admin/pdet/removeOrder", removeAdminOrder);

app.get("/api/admin/pdet/getAllVendors", getAllVendors);
app.post("/api/admin/pdet/addVendor", addVendor);
app.put("/api/admin/pdet/editVendor", editVendor);
app.delete("/api/admin/pdet/removeVendor", removeVendor);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
