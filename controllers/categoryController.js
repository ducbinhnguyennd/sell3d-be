const path = require("path");
const multer = require("multer");
const Category = require("../models/Category");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });
// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (err) {
    res.status(404).json({ message: "Không tìm thấy danh mục" });
  }
};

// CREATE
exports.createCategory = [
  upload.single("image"), // 🔥 middleware
  async (req, res) => {
    try {
      const { name, description, slug } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Thiếu name" });
      }

      const image = req.file ? `/uploads/${req.file.filename}` : "";

      const newCategory = new Category({
        name,
        description,
        slug,
        image
      });

      const saved = await newCategory.save();
      res.json(saved);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

// UPDATE
exports.updateCategory = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, slug } = req.body;

      const updateData = {
        name,
        description,
        slug
      };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá danh mục" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
