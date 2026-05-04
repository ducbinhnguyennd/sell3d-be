const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return !arr || arr.length <= 5;
        },
        message: "Chỉ được chọn tối đa 5 ảnh",
      },
    },
    description: { type: String },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    discountPercent: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);