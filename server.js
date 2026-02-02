const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// This grabs the key you saved in Render's "Environment Variables"
const API_KEY = process.env.GEMINI_KEY; 

app.post('/cortex', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Connect to Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: userMessage }] }] 
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server connection failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
