// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sitesee_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'],
    resource_type: 'auto', // Important for video uploads
  },
});

const parser = multer({ storage: storage });

module.exports = parser;