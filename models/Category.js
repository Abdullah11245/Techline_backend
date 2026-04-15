const mongoose = require("mongoose");

const subSubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subSubcategories: {
      type: [subSubcategorySchema],
      default: [],
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subcategories: {
      type: [subcategorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
