const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const streamifier = require("streamifier");

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, subcategory } = req.body;

    if (!req.file) return res.status(400).json({ message: "Image is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });

    // Upload image to Cloudinary
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer();

    const product = new Product({
      title,
      description,
      image: result.secure_url,
      category,       // should be category ObjectId
      subcategory,    // optional subcategory string
    });

    await product.save();
    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
  const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    ).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
