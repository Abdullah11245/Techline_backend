 const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Main category name, e.g., Firewall
      unique: true,
    },
    subcategories: [
      {
        name: { type: String, required: true }, // e.g., Fortigate, Sophos
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);