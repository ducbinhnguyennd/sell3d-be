const Blog = require("../models/Blog");


// GET ALL
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("category");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("category");
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    res.json(blog);
  } catch (err) {
    res.status(404).json({ message: "Không tìm thấy bài viết" });
  }
};

// CREATE
exports.createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };

    // Handle image upload
    if (req.file) {
      blogData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Parse tags if it's a string
    if (blogData.tags && typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const newBlog = new Blog(blogData);
    const saved = await newBlog.save();
    await saved.populate("category");
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.updateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };

    // Handle image upload
    if (req.file) {
      blogData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Parse tags if it's a string
    if (blogData.tags && typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      blogData,
      { new: true }
    ).populate("category");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá bài viết" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// INCREMENT VIEWS
exports.incrementViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("category");
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// SEARCH BLOGS
exports.searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const blogs = await Blog.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $elemMatch: { $regex: q, $options: "i" } } },
      ],
    }).populate("category");

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
