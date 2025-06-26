const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const connection = require("./src/config/connection");
const productRouter = require("./src/routes/product.route");
const registrationRouter = require("./src/routes/userRegistration.route");

const app = express();
const port =process.env.PORT || 9000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "src/uploads"), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'no-cache');
  }
}));

connection();

app.use("/registration", registrationRouter);
app.use("/product", productRouter);

app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
