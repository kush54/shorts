const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true,
}));
app.use(express.json());  

// app.post('/script', async (req, res) => {
//   const { prompt } = req.body; // Extract prompt from request body
//   console.log("chla")
//   console.log(prompt)
//   // Validate the prompt
//   if (!prompt || typeof prompt !== 'string') {
//     console.log("here?")
//       return res.status(400).json({ error: 'Invalid prompt provided.' });
//   }

//   try {
//     console.log("ok")
//       const response = await axios.post(
//           'https://api.openai.com/v1/chat/completions',
//           {
//               model: 'gpt-3.5-turbo',
//               messages: [{ role: 'user', content: prompt }],
//               max_tokens: 150,
//           },
//           {
//               headers: {
//                   Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//               },
//           }
//       );

//       res.json({ message: response.data.choices[0].message.content });
//     } catch (error) {
//       console.error("Error communicating with OpenAI:", error.response?.data || error.message);
//       res.status(500).json({ error: 'Failed to generate response.' });
//     }
    
// });

app.get('/api/search', async (req, res) => {
  const { query } = req.query; // Get search query from frontend
  try {
    console.log("gusa");
    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: {
        Authorization: `${process.env.PEXEL_API_KEY}`, // Ensure the "Bearer" is added
      },
      params: {
        query, // Search term
        per_page: 4, // Limit to 1 result
      },
    });

    console.log(response.data); // Log the actual response data
    res.json(response.data); // Return Pexels data to the frontend
  } catch (error) {
    console.error('Error fetching media from Pexels:', error);
    res.status(500).json({ error: 'Failed to fetch media from Pexels.' });
  }
});

app.post('/chatgpt', async (req, res) => {
  const { message } = req.body; // Message sent by the user
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Use "gpt-4" if needed
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error communicating with ChatGPT");
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
          parts: [{ text: `generate a 40 second interactive ,paragraph script on ${prompt}` }],
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



app.post('/merge', upload.array('videos', 2), (req, res) => {
  const [file1, file2] = req.files;
  const outputFilePath = `uploads/merged_${Date.now()}.mp4`;

  ffmpeg()
    .input(file1.path)
    .input(file2.path)
    .on('end', () => {
      res.download(outputFilePath, () => {
        // Cleanup files after download
        fs.unlinkSync(file1.path);
        fs.unlinkSync(file2.path);
        fs.unlinkSync(outputFilePath);
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Error merging videos');
    })
    .mergeToFile(outputFilePath);
});

// Basic home route
app.get("/", (req, res) => {
  res.send("Welcome to the ChatGPT API integration!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
