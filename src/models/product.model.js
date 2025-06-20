const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  unit: {
    type: String,
    enum: ["First", "Second", "Third"],
    required: true,
    trim: true,
  },
  hsnCode: {
    type: String,
    required: true,
    trim: true,
  },
  taxPreference: {
    type: String,
    enum: ["Taxable", "Exempted", "Nil Rated", "Non-GST"],
    required: true,
  },
  exemptionReason: {
    type: String,
    enum: ["None", "OTHER CHARGES"],
    default: "None",
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("EditItem", productSchema);
