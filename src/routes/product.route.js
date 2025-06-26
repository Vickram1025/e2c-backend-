const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const singleupload = require("../middlewares/multer");

router.post("/createproduct", singleupload, controller.createProduct);
router.get("/allproducts", controller.getAllProducts);
router.get("/product/:id", controller.getProductById);
router.put("/updateproduct/:id", singleupload, controller.updateProductById);
router.delete("/deleteproduct/:id", controller.deleteProductById);

module.exports = router;
