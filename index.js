const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connection = require("./src/config/connection");
const productRouter = require("./src/routes/product.route");
const registrationRouter = require("./src/routes/userRegistration.route");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/uploads", express.static("src/upload"));

connection();

app.use("/registration", registrationRouter);
app.use("/product", productRouter);

app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
