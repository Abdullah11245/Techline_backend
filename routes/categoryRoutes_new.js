// routes/category.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const auth = require("../middleware/auth");

const normalizeSubcategories = (subcategories = []) =>
  (Array.isArray(subcategories) ? subcategories : [])
    .map((sub) => {
      if (typeof sub === "string") {
        const name = sub.trim();
        return name ? { name, subSubcategories: [] } : null;
      }

      const name = typeof sub?.name === "string" ? sub.name.trim() : "";
      if (!name) return null;

      const subSubcategories = (Array.isArray(sub.subSubcategories) ? sub.subSubcategories : [])
        .map((child) => {
          if (typeof child === "string") {
            const childName = child.trim();
            return childName ? { name: childName } : null;
          }

          const childName = typeof child?.name === "string" ? child.name.trim() : "";
          return childName ? { name: childName } : null;
        })
        .filter(Boolean);

      return { name, subSubcategories };
    })
    .filter(Boolean);

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
router.post("/", auth, async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = new Category({
      name: name.trim(),
      subcategories: normalizeSubcategories(subcategories),
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add subcategory to existing category
router.post("/:id/subcategory", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Subcategory name is required" });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Avoid duplicates
    const trimmedName = name.trim();

    if (category.subcategories.some((sub) => sub.name === trimmedName)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subcategories.push({ name: trimmedName, subSubcategories: [] });
    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update category name and subcategories
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), subcategories: normalizeSubcategories(subcategories) },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
