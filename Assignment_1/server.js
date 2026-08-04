const express = require("express");
const connectDB = require("./db.js");
const joi = require("joi");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const AuthModel = require("./AuthModel");
const ProductModel = require("./productModel");
const app = express();
app.use(express.json());

// API's ----------

//REGISTRATION
app.post("/register", async (req, res) => {
  try {
    const validationSchema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().max(62).required(),
      password: joi.string().min(2).max(128).required(),
    });
    const { error } = validationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { name, email, password } = req.body;
    const existingUser = await AuthModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await AuthModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).send("user created successfully");
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// LOGIN API
app.post("/login", async (req, res) => {
  try {
    const validationSchema = joi.object({
      email: joi.string().max(62).email().required(),
      password: joi.string().min(2).max(128).required(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const { email, password } = req.body;
    const user = await AuthModel.findOne({ email });
    if (!user) {
      return res.status(400).send("invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("invalid email or password");
    }
    const token = jwt.sign({ id: user._id }, "technoNJR", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    res.json({ token, user });
  } catch (err) {
    console.log("error", err);
  }
});

// LOGOUT API
app.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
// ------------------------

// PRODUCT API's
// CREATE PRODUCT
app.post("/createproduct", async (req, res) => {
  try {
    const productSchema = joi.object({
      name: joi.string().required(),
      price: joi.number().required(),
      description: joi.string().required(),
      category: joi.string().required(),
      sku: joi.string().required(),
    });

    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { name, price, category, description, sku } = req.body;
    const existingProduct = await ProductModel.findOne({ name });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product already exists",
      });
    }
    const newProduct = await ProductModel.create({
      name,
      price,
      category,
      description,
      sku,
    });

    res.status(201).json({
      message: "Product created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const products = await ProductModel.find()
      .select("name price category quantity")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// GET PRODUCT BY ID
app.get("/getSingleProduct/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// UPDATE PRODUCT
app.patch("/updateSingleProduct/:id", async (req, res) => {
  try {
    const productid = req.params.id;

    const productSchema = joi.object({
      name: joi.string(),
      price: joi.number().min(0),
      description: joi.string(),
      category: joi.string(),
      sku: joi.string(),
    });

    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const existingproduct = await ProductModel.findById(productid);

    if (!existingproduct) {
      res.status(404).send({ message: "Product already exist" });
    }

    const updateProduct = await ProductModel.findByIdAndUpdate(
      productid,
      req.body,
      {
        new: true,
      },
    );

    res.status(201).send({
      message: "Product updated successfully",
      product: updateProduct,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Invalid server error" });
  }
});
// DELETE PRODUCT BY ID
app.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    await ProductModel.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// ----------------------------
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.log("database connection error");
  });
