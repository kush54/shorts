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
const rateLimit = require('express-rate-limit');


const app = express();
const port = process.env.PORT || 5000;

// origin: 'http://localhost:3000', 

// Middleware
app.use(cors({
  origin: 'https://shorts-1.onrender.com', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true,
}));
app.use(express.json());  


app.get('/api/search', async (req, res) => {
  const { query } = req.query; // Get search query from frontend
  
  console.log(query,"aya")
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
    const GEMINI_API_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const data = {
      contents: [{
        parts: [{ 
          text: `Generate a 40-second interactive paragraph script on ${prompt}. Use only plain text, no special characters or markdown.` 
        }]
      }]
    };

    // Corrected API endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    // Proper response parsing
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No content generated");
    }

    res.status(200).json({ script: generatedText });
    
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to generate content",
      details: error.response?.data || error.message
    });
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


const upload = multer({ dest: 'uploads/' });

app.post('/merge', upload.array('videos'), async (req, res) => {
  const outputPath = `./merged_${Date.now()}.mp4`;
  const tempList = `./list_${Date.now()}.txt`;
  let tempFiles = [];

  try {
    const videos = JSON.parse(req.body.videos);
    let fileIndex = 0;

    // 1. Process individual video clips
    tempFiles = await Promise.all(
      videos.map(async (video) => {
        let inputPath;
        if (video.type === 'uploaded') {
          if (!req.files || fileIndex >= req.files.length) {
            throw new Error('Missing uploaded file for video: ' + JSON.stringify(video));
          }
          inputPath = req.files[fileIndex].path;
          fileIndex++;
        } else {
          inputPath = video.url;
        }

        const tempPath = `./video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`;
        
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(inputPath)
            .inputOptions([
              '-ss', String(video.startTime),
              '-t', String(video.endTime - video.startTime)
            ])
            .outputOptions([
              '-c:v libx264',
              '-an',
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

    // 2. Create concatenation list
    const fileList = tempFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(tempList, fileList);

    // 3. Merge processed clips
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempList)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c:v copy', '-an'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // 4. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: 'video',
      folder: 'merged-videos'
    });

    // 5. Send response
    res.json({ success: true, mergedUrl: result.secure_url });

  } catch (error) {
    console.error('Merge Error:', error);
    res.status(500).json({ 
      error: 'Merge failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // 6. Cleanup temporary files
    const filesToDelete = [tempList, outputPath, ...tempFiles];
    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlink(file, err => {
          if (err) console.error('Cleanup error:', err);
        });
      }
    });
    
    // Cleanup uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Upload cleanup error:', err);
        });
      });
    }
  }
});


const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const util = require('util');

const textToSpeechClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const generateAudio = async (text) => {
  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for conversion');
    }

    // Generate speech
    const [response] = await textToSpeechClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Studio-O',
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0
      }
    });

    return {
      audioContent: response.audioContent,
      mimeType: 'audio/mpeg'
    };
    
  } catch (error) {
    console.error('TTS Error:', error);
    throw new Error('Failed to generate audio');
  }
};



app.post('/generate-audio', async (req, res) => {
  try {
    const { text } = req.body;
    console.log(text)
    // Generate audio
    const { audioContent, mimeType } = await generateAudio(text);
    
    // Send binary response
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': 'attachment; filename="narration.mp3"'
    });
    res.send(Buffer.from(audioContent, 'binary'));

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: error.message || 'Audio generation failed' 
    });
  }
});


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Constants
const MAX_PAGE_SIZE = 50;
const VALID_CATEGORIES = new Set([
  'general', 'business', 'entertainment', 
  'health', 'science', 'sports', 'technology'
]);

// News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    // Validate and sanitize inputs
    let { category = 'general', pageSize = 20 } = req.query;
    
    // Validate category
    category = category.toLowerCase();
    if (!VALID_CATEGORIES.has(category)) {
      return res.status(400).json({
        error: 'Invalid news category',
        validCategories: Array.from(VALID_CATEGORIES)
      });
    }

    // Validate pageSize
    pageSize = Math.min(
      Math.max(parseInt(pageSize) || 20, 1),
      MAX_PAGE_SIZE
    );

    // Fetch from NewsAPI
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category,
        pageSize,
        apiKey: process.env.NEWS_API_KEY
      },
      timeout: 5000
    });

    // Handle NewsAPI errors
    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || 'News API error');
    }

    // Transform response
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name,
      content: article.content
    }));

    // Cache control headers
    res.setHeader('Cache-Control', 'public, max-age=300');
    
    res.json(articles);

  } catch (error) {
    console.error('News API Error:', error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch news';

    res.status(statusCode).json({
      error: errorMessage,
      ...(error.response?.data?.code && { code: error.response.data.code })
    });
  }
});


// Add to your existing backend code
// app.post('/add-audio', upload.single('audio'), async (req, res) => {
//   const { videoUrl } = req.body;
//   const audioPath = req.file.path;
//   const outputPath = `./final_${Date.now()}.mp4`;

//   try {
//     // Download the video file
//     const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
//     const videoPath = `./temp_video_${Date.now()}.mp4`;
//     const writer = fs.createWriteStream(videoPath);
//     videoResponse.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on('finish', resolve);
//       writer.on('error', reject);
//     });

//     // Merge audio with ffmpeg
//     await new Promise((resolve, reject) => {
//       ffmpeg()
//         .input(videoPath)
//         .input(audioPath)
//         .outputOptions([
//           '-c:v copy',
//           '-c:a aac',
//           '-map 0:v',
//           '-map 1:a',
//           '-shortest'
//         ])
//         .output(outputPath)
//         .on('end', resolve)
//         .on('error', reject)
//         .run();
//     });

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(outputPath, {
//       resource_type: 'video',
//       folder: 'final-videos'
//     });

//     res.json({ success: true, finalUrl: result.secure_url });
//   } catch (error) {
//     console.error('Audio Merge Error:', error);
//     res.status(500).json({ error: 'Audio merge failed', details: error.message });
//   } finally {
//     // Cleanup temporary files
//     [videoPath, audioPath, outputPath].forEach(file => {
//       if (fs.existsSync(file)) fs.unlinkSync(file);
//     });
//   }
// });


app.post('/add-audio', upload.single('audio'), async (req, res) => {
  let videoPath;
  let audioPath;
  let outputPath;

  try {
    const { videoUrl } = req.body;
    audioPath = req.file?.path;
    outputPath = path.join(__dirname, `final_${Date.now()}.mp4`);

    // Download video
    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    videoPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(videoPath);
    videoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // FFmpeg processing
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Cloudinary upload
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: 'video',
      folder: 'final-videos'
    });

    res.json({ 
      success: true, 
      finalUrl: result.secure_url 
    });

  } catch (error) {
    console.error('Audio Merge Error:', error);
    res.status(500).json({ 
      error: 'Audio merge failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Safe cleanup
    const cleanup = async (filePath) => {
      if (!filePath) return;
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up: ${filePath}`);
        }
      } catch (err) {
        console.error(`Cleanup error for ${filePath}:`, err.message);
      }
    };

    await cleanup(videoPath);
    await cleanup(audioPath);
    await cleanup(outputPath);
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the ChatGPT API integration!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// https://creator-kit-1.onrender.com/