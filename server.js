const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_KEY;

app.post('/cortex', async (req, res) => {
    if (!API_KEY) {
        console.error("ERROR: GEMINI_KEY is missing.");
        return res.status(500).json({ error: "Server Error: Key missing." });
    }

    const userMessage = req.body.message;
    console.log("Sending to Google:", userMessage);

    try {
        // ✅ FIXED: Changed 'gemini-1.5-flash' to 'gemini-2.5-flash'
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: userMessage }] }] 
            })
        });

        const data = await response.json();

        // Check if Google sent an error back
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(400).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
