const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
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
    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (err) {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};

// GET BY SLUG
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.productSlug })
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (err) {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};
exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params; // lấy categorySlug từ params

    // Tìm category theo slug
    const categoryDoc = await Category.findOne({ slug: categorySlug });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" });
    }

    const products = await Product.find({ category: categoryDoc._id })
      .populate("category") 
      .sort({ createdAt: -1 }); // mới nhất lên đầu

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { category, name } = req.body;

    // 🔥 kiểm tra category có tồn tại không
    const checkCategory = await Category.findById(category);
    if (!checkCategory) {
      return res.status(400).json({ message: "Category không tồn tại" });
    }

    // Xử lý images từ files upload
    let images = [];
    if (req.files) {
      if (req.files.images) {
        images = req.files.images.map(file => `/uploads/${file.filename}`);
      } else if (req.files.image) {
        images = req.files.image.map(file => `/uploads/${file.filename}`);
      }
    }

    // Tạo slug từ name
    const slug = name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');

    const newProduct = new Product({ ...req.body, slug, images });
    const saved = await newProduct.save();

    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = req.body;

    // Xử lý images từ files upload
    if (req.files) {
      if (req.files.images) {
        updateData.images = req.files.images.map(file => `/uploads/${file.filename}`);
      } else if (req.files.image) {
        updateData.images = req.files.image.map(file => `/uploads/${file.filename}`);
      }
    }

    if (name) {
      // Tạo slug mới từ name
      updateData.slug = name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
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