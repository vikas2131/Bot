const express = require('express');
const axios = require('axios');
require('dotenv').config();

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

app.use(express.static('public'));  
app.use(express.json());  

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await openai.chat.completions.create(
            {
                model: 'gpt-3.5-turbo',  
                messages: [
                    { role: 'system', content: `Hello! I'm your friendly AI tutor here to assist you with any questions related to the UPSC domain. I can help you with exam preparation, study materials, subject insights, current affairs, and general guidance on how to approach the UPSC exams.

Please feel free to ask me anything related to the UPSC, and I'll be happy to help. However, I kindly request that you keep questions strictly related to the UPSC domain. If you ask about topics outside this area, I'll politely decline and suggest you ask something relevant to your UPSC journey. Use line breaks between sections for clarity, making answers much easier to read. Let's focus on making your preparation as smooth and effective as possible!` },
                    { role: 'user', content: userMessage }
                ]
            }
        );
        
        const chatbotReply = response.choices[0].message.content;
        res.json({ reply: chatbotReply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
