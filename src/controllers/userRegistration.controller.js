const userRegistration = require("../models/userRegistration.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMailToUser = require("../utils/email");
const validator = require("validator");
require("dotenv").config(); 


const registrationUser = async (req, res) => {
  try {
    const { body, file } = req;

    const checkMail = await userRegistration.findOne({ email: body.email });
    if (checkMail) {
      return res.status(409).json({ message: "Email ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const registrationData = {
      ...body,
      password: hashedPassword,
      image: file?.filename || "",
    };

    const saveUser = await userRegistration.create(registrationData);

    const htmlContent = `
      <p>Welcome ${body.userName},</p>
      <p>Your account has been created.</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Password:</strong> ${body.password}</p>
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
    if (!findMail) {
      return res.status(404).json({ message: "User not registered" });
    }

    const findPassword = await bcrypt.compare(userData.password, findMail.password);
    if (!findPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      user: {
        id: findMail._id,
        userName: findMail.userName,
        email: findMail.email,
      },
    });

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
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      firstName: body.firstName || existingUser.firstName,
      lastName: body.lastName || existingUser.lastName,
      userName: body.userName || existingUser.userName,
      email: body.email || existingUser.email,
      image: file?.filename || existingUser.image,
      password:body.password || existingUser.password
    };
    console.log(updateData);
    

   
    if (body.password && body.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateData.password = hashedPassword;

      const htmlContent = `
        <h3>Password Updated</h3>
        <p>Hello <strong>${updateData.userName}</strong>,</p>
        <p>Your password has been successfully updated.</p>
        <p><strong>Email:</strong> ${updateData.email}</p>
        <p><strong>New Password:</strong> ${body.password}</p>
        <p>If you did not request this change, please contact support immediately.</p>
      `;

      await sendMailToUser(updateData.email, htmlContent, updateData.userName);
    }

    const updatedUser = await userRegistration.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
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

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    console.log({email});
    

    const user = await userRegistration.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password/${user._id}/${token}`;
    console.log(resetLink);
    
    const htmlContent = `
      <p>Hello ${user.userName},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `;

    await sendMailToUser(user.email, htmlContent, user.userName);
    res.status(200).json({ message: "Reset link sent to email" },resetLink);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { newPassword } = req.body;

    jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userRegistration.findByIdAndUpdate(id, { password: hashedPassword });

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user);
    

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
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
