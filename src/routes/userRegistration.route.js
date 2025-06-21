const express = require("express");
const router = express.Router();
const controller = require("../controllers/userRegistration.controller");
const singleupload = require("../middelwar/multer");

router.post("/createuser", singleupload, controller.registrationUser);
router.post("/signin", controller.signin);
router.get("/allUserData", controller.getUserData);
router.put("/edit/:id", singleupload, controller.editUserById);
router.delete("/delete/:id", controller.deleteUserById);


router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password/:id/:token", controller.resetPassword);

module.exports = router;
