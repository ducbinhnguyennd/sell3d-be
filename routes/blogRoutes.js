const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViews,
  searchBlogs,
} = require("../controllers/blogController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", getBlogs);
router.get("/search", searchBlogs);
router.get("/:id", getBlogById);
router.post("/", upload.single('image'), createBlog);
router.put("/:id", upload.single('image'), updateBlog);
router.delete("/:id", deleteBlog);
router.put("/:id/views", incrementViews);

// Upload image for editor
router.post("/upload-image", upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
