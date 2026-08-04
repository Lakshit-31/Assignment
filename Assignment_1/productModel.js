const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxLength: 264,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
