const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const API_KEY = process.env.GEMINI_KEY; 

app.post('/cortex', async (req, res) => {
    // 1. Check if Key exists on Server
    if (!API_KEY) {
        console.error("ERROR: GEMINI_KEY is missing in Render Environment Variables.");
        return res.status(500).json({ error: { message: "Server Error: API Key is missing." } });
    }

    try {
        const userMessage = req.body.message;
        
        // 2. Print what we are sending (for logs)
        console.log("Sending to Google:", userMessage);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: userMessage }] }] 
            })
        });

        const data = await response.json();

        // 3. If Google gives an error, pass it to the Website so we can see it
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(400).json(data); // Send the Google error back
        }

        res.json(data);

    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ error: { message: "Internal Server Error" } });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
