const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const parseCategories = (body) => {
  if (body.categories) {
    if (Array.isArray(body.categories)) return body.categories;
    if (typeof body.categories === "string") {
      try {
        const parsed = JSON.parse(body.categories);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        return body.categories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
  }

  if (body.category) {
    return Array.isArray(body.category) ? body.category : [body.category];
  }

  return [];
};
// GET ALL
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categories");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const buildVietnameseRegex = (str) => {
  const map = {
    a: "aàáạảãâầấậẩẫăằắặẳẵ",
    e: "eèéẹẻẽêềếệểễ",
    i: "iìíịỉĩ",
    o: "oòóọỏõôồốộổỗơờớợởỡ",
    u: "uùúụủũưừứựửữ",
    y: "yỳýỵỷỹ",
    d: "dđ"
  };

  return str
    .toLowerCase()
    .split("")
    .map((char) => {
      if (map[char]) {
        return `[${map[char]}]`;
      }
      return char;
    })
    .join("");
};
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    let query = {};

    // 🔍 search không dấu (fake bằng regex)
    if (keyword) {
      const regexStr = buildVietnameseRegex(keyword);

      query.name = {
        $regex: regexStr,
        $options: "i"
      };
    }

    // 📂 category
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });

      if (!categoryDoc) {
        return res.status(404).json({ message: "Không tìm thấy thể loại" });
      }

      query.categories = categoryDoc._id;
    }

    const products = await Product.find(query)
      .populate("categories")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET BY ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categories");

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
      .populate("categories");

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

    const products = await Product.find({ categories: categoryDoc._id })
      .populate("categories") 
      .sort({ createdAt: -1 }); // mới nhất lên đầu

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { name, price, discountPercent } = req.body;
    const categories = parseCategories(req.body);

    if (categories.length === 0) {
      return res.status(400).json({ message: "Phải chọn ít nhất một danh mục" });
    }

    const validCategories = await Category.find({ _id: { $in: categories } });
    if (validCategories.length !== categories.length) {
      return res.status(400).json({ message: "Một hoặc nhiều thể loại không tồn tại" });
    }

    const parsedPrice = parseFloat(price);
    const parsedDiscount = discountPercent ? parseFloat(discountPercent) : 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Giá phải là số hợp lệ" });
    }
    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ message: "% giảm phải từ 0 đến 100" });
    }

    const discountPrice = Math.round(parsedPrice * (100 - parsedDiscount) / 100);

    // 🔥 FIX CHUẨN Ở ĐÂY
    let images = [];

    if (req.files) {
      // trường hợp upload.array("images")
      if (Array.isArray(req.files)) {
        images = req.files.map(file => `/uploads/${file.filename}`);
      }

      // trường hợp upload.fields([{ name: "images" }])
      else if (req.files.images) {
        images = req.files.images.map(file => `/uploads/${file.filename}`);
      }
    }

    // Debug
    console.log("FILES:", req.files);
    console.log("IMAGES:", images);

    const slug = name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');

    const newProduct = new Product({
      ...req.body,
      categories,
      price: parsedPrice,
      discountPercent: parsedDiscount,
      discountPrice,
      slug,
      images,
    });

    const saved = await newProduct.save();
    res.json(saved);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, discountPercent } = req.body;
    let updateData = { ...req.body };

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const categories = parseCategories(req.body);
    if (categories.length > 0) {
      const validCategories = await Category.find({ _id: { $in: categories } });
      if (validCategories.length !== categories.length) {
        return res.status(400).json({ message: "Một hoặc nhiều thể loại không tồn tại" });
      }
      updateData.categories = categories;
    }

    const parsedPrice = price !== undefined ? parseFloat(price) : product.price;
    const parsedDiscount = discountPercent !== undefined
      ? parseFloat(discountPercent)
      : product.discountPercent || 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Giá phải là số hợp lệ" });
    }
    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ message: "% giảm phải từ 0 đến 100" });
    }

    updateData.price = parsedPrice;
    updateData.discountPercent = parsedDiscount;
    updateData.discountPrice = Math.round(parsedPrice * (100 - parsedDiscount) / 100);

    // 🔥 FIX IMAGE UPDATE
    let newImages = [];

    if (req.files) {
      if (Array.isArray(req.files)) {
        newImages = req.files.map(file => `/uploads/${file.filename}`);
      } else if (req.files.images) {
        newImages = req.files.images.map(file => `/uploads/${file.filename}`);
      }
    }

    // 👉 nếu có ảnh mới → cộng thêm vào ảnh cũ
    if (newImages.length > 0) {
      updateData.images = [...product.images, ...newImages];
    }

    if (name) {
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