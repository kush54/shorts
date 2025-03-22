const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath); // Set FFmpeg path explicitly
dotenv.config(); 
const cloudinary = require("./config/cloudinary");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true,
}));
app.use(express.json());  


app.get('/api/search', async (req, res) => {
  const { query } = req.query; // Get search query from frontend
  console.log(query)
  try {
    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: {
        Authorization: `${process.env.PEXEL_API_KEY}`, // Ensure the "Bearer" is added
      },
      params: {
        query, // Search term
        per_page: 4, // Limit to 1 result
      },
    });
    console.log(response.data)
    res.json(response.data); // Return Pexels data to the frontend
  } catch (error) {
    console.error('Error fetching media from Pexels:', error);
    res.status(500).json({ error: 'Failed to fetch media from Pexels.' });
  }
});

app.post("/script", async (req, res) => {
  const prompt = req.body.prompt || "Explain how AI works"; 
  try {
    // API key for the Gemini API (replace with your key)
    const GEMINI_API_KEY = process.env.GEMINI_KEY;

    // Payload data
    const data = {
      contents: [
        {
          parts: [{ text: `generate a 40 second interactive ,paragraph script on ${prompt} just include text no specail character or sound suggestion just pure text` }],
        },
      ],
    };

    // Make the API call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Send the response back to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error making API call:", error.message);
    res.status(500).json({ error: "Failed to fetch content from Gemini API" });
  }
});




axios.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 429) {
    console.log('⚠️ Rate Limit Exceeded - Retrying in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    return axios.request(error.config);
  }
  return Promise.reject(error);
});



app.post('/merge', async (req, res) => {
  const outputPath = `./merged_${Date.now()}.mp4`;
  const tempList = `./list_${Date.now()}.txt`;
  let tempFiles = [];

  try {
    const { videos } = req.body;

    // 1. Process videos (audio disabled)
    tempFiles = await Promise.all(
      videos.map(async (video, index) => {
        const tempPath = `./video_${index}_${Date.now()}.mp4`;
        
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(video.url)
            .inputOptions([
              '-ss', String(video.startTime),
              '-t', String(video.endTime - video.startTime)
            ])
            .outputOptions([
              '-c:v libx264',
              '-an', // Disable audio
              '-vf scale=1280:720:force_original_aspect_ratio=decrease',
              '-r 30',
              '-pix_fmt yuv420p'
            ])
            .output(tempPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        return tempPath;
      })
    );

    // 2. Create list file
    const fileList = tempFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(tempList, fileList);

    // 3. Merge videos (audio disabled)
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempList)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions([
          '-c:v copy',
          '-an' // Ensure no audio in final output
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // 4. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: 'video',
      folder: 'merged-videos'
    });

    res.json({ success: true, mergedUrl: result.secure_url });
  } catch (error) {
    console.error('Merge Error:', error);
    res.status(500).json({ error: 'Merge failed', details: error.message });
  } finally {
    // Cleanup
    [tempList, outputPath, ...tempFiles].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
});


app.get("/", (req, res) => {
  res.send("Welcome to the ChatGPT API integration!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
