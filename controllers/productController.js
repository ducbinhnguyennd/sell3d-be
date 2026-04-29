const Product = require("../models/Product");
const Category = require("../models/Category");
// GET ALL
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { category } = req.body;

    // 🔥 kiểm tra category có tồn tại không
    const checkCategory = await Category.findById(category);
    if (!checkCategory) {
      return res.status(400).json({ message: "Category không tồn tại" });
    }

    const newProduct = new Product(req.body);
    const saved = await newProduct.save();

    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá sản phẩm" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};