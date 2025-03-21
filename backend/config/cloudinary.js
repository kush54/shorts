const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');
console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_API_SECRET)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;



// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "videos",
//     resource_type: "video", // Ensures Cloudinary processes it as a video
//     format: "mp4", // Forces video format
//   },
// });

// const upload = multer({ storage });

// // Upload Route
// const upload = multer({ dest: "uploads/" }); // Temporary storage

// app.post("/upload", upload.single("video"), async (req, res) => {
//   try {
//     console.log("Upload route hit!");

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     console.log("Uploading to Cloudinary...");
    
//     // Upload file to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       resource_type: "video",
//       folder: "videos",
//     });

//     console.log("Cloudinary Response:", result);

//     // Delete local file after upload
//     fs.unlinkSync(req.file.path);

//     res.json({
//       success: true,
//       url: result.secure_url,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ error: "Upload failed", details: error.message });
//   }
// });