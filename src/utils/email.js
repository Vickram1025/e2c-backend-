const nodemailer = require("nodemailer");
require("dotenv").config(); // ✅ Load environment variables

const sendMailToUser = async (email, htmlContent, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"e2C Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "e2C Your Account Details",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Mail successfully sent to", email);
  } catch (error) {
    console.log("Mail not sent:", error.message);
  }
};

module.exports = sendMailToUser;
