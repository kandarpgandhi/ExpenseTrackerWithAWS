// const express = require('express');
// const router = express.Router();
// let genai = require('@google/genai')
// require('dotenv').config();

// let ai = new genai.GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });

// router.post('/suggest-category', async (req, res) => {
//     try {
//         const { description } = req.body;
//         if (!description) {
//             return res.status(400).json({ error: 'Description is required' });
//         }

//         // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//         // const prompt = `
//         // You are an expense tracking assistant.
//         // Based on the following expense description, suggest one of these categories:
//         // - Food
//         // - Fuel
//         // - Other

//         // Description: "${description}"
//         // Respond with only the category name.
//         // `;

//         // const result = await model.generateContent(prompt);
//         // const suggestion = result.response.text().trim();

//         // res.json({ category: suggestion });
//         async function main() {
//             const prompt = `Give me suggestion of expense category where this description fits.Description: ${description} `
//             const response = await ai.models.generateContent({
//                 model: "gemini-2.5-flash",
//                 contents: prompt,
//             })
//             res.json({ category: response.text })
//         }
//     } catch (err) {
//         console.error('Gemini error:', err);
//         res.status(500).json({ error: 'Failed to generate suggestion' });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
let genai = require('@google/genai')
require('dotenv').config();

let ai = new genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post('/suggest-category', async (req, res) => {
    try {
        // Now 'description' should be correctly destructured
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        // 1. Change the system instruction to suggest *any* suitable category
        const prompt = `Based on the expense description, suggest the most suitable single-word, common expense category. Examples: Groceries, Entertainment, Travel, Bills, Rent, Salary. Respond with ONLY the single-word category name, capitalized like 'Groceries'.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                // Use the new, unconstrained instruction
                systemInstruction: prompt
            },
            contents: `Description: "${description}"`
        });

        // The AI's response text will be just the suggested category (e.g., "Groceries")
        // We'll return the suggested text as is, and let the client convert it to lowercase.
        const suggestion = response.text.trim();

        res.json({ category: suggestion });

    } catch (err) {
        console.error('Gemini error:', err);
        // Note: The original logic in aiRoutes.js was flawed; this is the corrected error handling.
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
});

module.exports = router;