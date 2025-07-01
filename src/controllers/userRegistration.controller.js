const userRegistration = require("../models/userRegistration.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMailToUser = require("../utils/email");
const validator = require("validator");
const path = require("path");
const fs = require("fs");



const registrationUser = async (req, res) => {
  try {
    const { body, file } = req;

    

    const checkMail = await userRegistration.findOne({ email: body.email });
    if (checkMail) return res.status(409).json({ message: "Email ID already exists" });

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const registrationData = {
      ...body,
      password: hashedPassword,
      image: file.filename,
    };

    const saveUser = await userRegistration.create(registrationData);

    const htmlContent = `
      <p>Welcome ${body.userName},</p>
      <p>Your account has been created.</p>
      <p><strong>Name : </strong> ${body.firstName}.${body.lastName}</p>
      <p><strong>userName:</strong> ${body.userName}</p>
      <p><strong>Email:</strong> ${body.email}</p>
     
    `;

    await sendMailToUser(body.email, htmlContent, body.userName);

    res.status(201).json({ saveUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const signin = async (req, res) => {
  try {
    const userData = req.body;
    const findMail = await userRegistration.findOne({ email: userData.email });
   
    
    if (!findMail) return res.status(404).json({ message: "User not registered" });

    const findPassword = await bcrypt.compare(userData.password, findMail.password);
  
    
    if (!findPassword) return res.status(401).json({ message: "Incorrect password" });
    console.log(findMail);
    

    res.status(200).json({
      user: {
        id: findMail._id,
        userName: findMail.userName,
        email: findMail.email,
        image: findMail.image,
      },
      
      
    });
    console.log("successfully login ");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUserData = async (req, res) => {
  try {
    const allUserData = await userRegistration.find();
    res.status(200).json(allUserData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const editUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, file } = req;

    const existingUser = await userRegistration.findById(id);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const updateData = {
      firstName: body.firstName || existingUser.firstName,
      lastName: body.lastName || existingUser.lastName,
      userName: body.userName || existingUser.userName,
      email: body.email || existingUser.email,
      image: file?.filename || existingUser.image,
    };

    if (file && existingUser.image) {
      const oldImagePath = path.join(__dirname, "../uploads", existingUser.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    if (body.password && body.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateData.password = hashedPassword;

      const htmlContent = `
        <h3>Password Updated</h3>
        <p>Hello <strong>${updateData.userName}</strong>,</p>
        <p>Your password has been successfully updated.</p>
        <p><strong>Email:</strong> ${updateData.email}</p>
        <p><strong>New Password:</strong> ${body.password}</p>
      `;

      await sendMailToUser(updateData.email, htmlContent, updateData.userName);
    } else {
      updateData.password = existingUser.password;
    }

    const updatedUser = await userRegistration.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userRegistration.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (deletedUser.image) {
      const imagePath = path.join(__dirname, "../uploads", deletedUser.image);
      console.log("Deleting file at:", imagePath);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
      } else {
        console.log("No image file found to delete.");
      }
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email address" });

    const user = await userRegistration.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" } ,  );
    
    const resetLink = `http://localhost:3000/reset-password/${user._id}/${token}`;

    const htmlContent = `
      <p>Hello ${user.userName},</p>
      <p>Reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `;

    await sendMailToUser(user.email, htmlContent, user.userName);
    res.status(200).json({ message: "Reset link sent", resetLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    

    if (decoded.id !== id) {
      return res.status(401).json({ error: "Invalid token or ID mismatch." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userRegistration.findByIdAndUpdate(id, { password: hashedPassword });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Reset link expired. Please request a new one." });
    }

    res.status(400).json({ error: "Invalid or expired token." });
  }
};


module.exports = {
  registrationUser,
  signin,
  getUserData,
  editUserById,
  deleteUserById,
  forgotPassword,
  resetPassword,
};
