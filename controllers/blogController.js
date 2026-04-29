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
    const newBlog = new Blog(req.body);
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
    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
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
