// routes/category.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    console.log("Fetched categories:", categories);
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new category
router.post("/", async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = new Category({
      name,
      subcategories: subcategories || [], // optional array of {name}
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add subcategory to existing category
router.post("/:id/subcategory", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Subcategory name is required" });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Avoid duplicates
    if (category.subcategories.some((sub) => sub.name === name)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subcategories.push({ name });
    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;