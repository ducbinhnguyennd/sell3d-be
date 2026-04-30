const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategorySlug,
} = require("../controllers/productController");

module.exports = (upload) => {
  router.get("/", getProducts);
  router.get("/categories/:categorySlug", getProductsByCategorySlug);
  router.get("/id/:id", getProductById);
  router.get("/:productSlug", getProductBySlug);
  router.post(
    "/",
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "image", maxCount: 5 },
    ]),
    createProduct
  );
  router.put(
    "/id/:id",
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "image", maxCount: 5 },
    ]),
    updateProduct
  );
  router.delete("/id/:id", deleteProduct);

  return router;
};