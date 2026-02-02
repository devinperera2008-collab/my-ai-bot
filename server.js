const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

// allow the website to talk to this server
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_KEY;

app.post('/cortex', async (req, res) => {
    // 1. Safety Check: Is the key there?
    if (!API_KEY) {
        console.error("CRITICAL ERROR: GEMINI_KEY is missing in Render Environment.");
        return res.status(500).json({ error: "Server Configuration Error: API Key missing." });
    }

    // 2. Safety Check: Did the website send a message?
    const userMessage = req.body.message;
    if (!userMessage) {
        console.error("ERROR: No message received from website.");
        return res.status(400).json({ error: "Bad Request: No message provided." });
    }

    console.log("Received message from website. Sending to Gemini...");

    try {
        // 3. Send to Google
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: userMessage }] }] 
            })
        });

        const data = await response.json();

        // 4. Detailed Error Handling (The Anti-400 Feature)
        if (!response.ok) {
            console.error("GOOGLE API ERROR:", JSON.stringify(data, null, 2));
            // Send the exact reason back to your website console
            return res.status(400).json({ 
                error: "Google API Error", 
                details: data.error?.message || "Unknown error from Google" 
            });
        }

        // 5. Success
        console.log("Gemini replied successfully.");
        res.json(data);

    } catch (error) {
        console.error("SERVER CRASH:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
