import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect, admin } from '../middleware/auth.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// @desc    Translate text using Gemini AI
// @route   POST /api/translate
// @access  Private
router.post('/', protect, admin, async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Text and target language are required'
      });
    }

    if (targetLanguage !== 'kh' && targetLanguage !== 'en') {
      return res.status(400).json({
        success: false,
        message: 'Target language must be "en" (English) or "kh" (Khmer)'
      });
    }

    const sourceLanguage = targetLanguage === 'kh' ? 'English' : 'Khmer';
    const targetLang = targetLanguage === 'kh' ? 'Khmer' : 'English';

    const prompt = `
      Translate the following ${sourceLanguage} text to ${targetLang}. 
      Maintain the original meaning, tone, and context. 
      If the text contains HTML tags, preserve them in the translation.
      
      ${sourceLanguage} text:
      ${text}
      
      Please provide only the ${targetLang} translation without any additional text or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation,
        sourceLanguage: sourceLanguage.toLowerCase(),
        targetLanguage: targetLang.toLowerCase()
      }
    });

  } catch (error) {
    logger.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to translate text',
      error: error.message
    });
  }
});

export default router;
