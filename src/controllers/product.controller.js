const Product = require("../models/product.model");


const createProduct = async (req, res) => {
  try {
    const { body, file } = req;

    const productData = {
      ...body,
      image: file?.filename || "",
    };

    const savedProduct = await Product.create(productData);
    console.log(savedProduct);
    

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, file } = req;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ message: "Product not found" });

    const updatedData = {
      ...body,
      image: file?.filename || existingProduct.image,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
