// config/cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
console.log("cloudinary",process.env.CLOUDINARY_CLOUD_NAME);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-images", // A folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg"],
    // You can add transformations here if you want
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
