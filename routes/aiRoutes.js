const express = require('express');
const router = express.Router();
let genai = require('@google/genai')
require('dotenv').config();

let ai = new genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post('/suggest-category', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const prompt = `Based on the expense description, suggest the most suitable single-word, common expense category. Examples: Groceries, Entertainment, Travel, Bills, Rent, Salary. Respond with ONLY the single-word category name, capitalized like 'Groceries'.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: prompt
            },
            contents: `Description: "${description}"`
        });

        const suggestion = response.text.trim();

        res.json({ category: suggestion });

    } catch (err) {
        console.error('Gemini error:', err);
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
});

module.exports = router;