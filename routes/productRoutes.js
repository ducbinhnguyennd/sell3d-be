const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// 🔥 MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ROUTES
router.get("/", getProducts);
router.get("/id/:id", getProductById);
router.get("/slug/:productSlug", getProductBySlug);

router.post("/", upload.array("images", 10), createProduct);
router.put("/id/:id", upload.array("images", 10), updateProduct);

router.delete("/id/:id", deleteProduct);

module.exports = router;