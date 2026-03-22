import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/forge', async (req, res) => {
  try {
    const { prompt, language, appType, payments } = req.body;

    const systemPrompt = `Tu es un expert en développement web. Génère une application web complète, fonctionnelle, en HTML/CSS/JS (un seul fichier), pour le projet suivant :
Description : ${prompt}
Type : ${appType}
Langue de l'interface : ${language}
Paiements à intégrer : ${payments.join(', ')}

L'application doit être responsive, professionnelle, et contenir des données de démonstration. Retourne uniquement le code HTML dans un bloc markdown.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    // Extraire le code HTML du bloc markdown (```html ... ```)
    const codeMatch = text.match(/```html\n([\s\S]*?)```/);
    const appCode = codeMatch ? codeMatch[1] : text;

    res.json({ success: true, appCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
