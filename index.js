const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_PUBLIC,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());
const user = require("./Routes/user");
app.use(user);

const charactere = require("./Routes/charactere");
app.use(charactere);

const comics = require("./Routes/comic");
app.use(comics);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur le Serveur Marvel" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route est introuvable" });
});

app.listen(process.env.PORT, () => {
  console.log("Server On");
});
