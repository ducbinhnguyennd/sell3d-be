const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
