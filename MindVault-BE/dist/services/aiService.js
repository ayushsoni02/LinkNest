"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLinkDigest = generateLinkDigest;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
});
/**
 * Generates a concise summary and key takeaways using the Gemini API.
 * @param contextString The extracted text or dynamic description to summarize.
 * @returns A structured DigestResult object.
 */
function generateLinkDigest(contextString) {
    return __awaiter(this, void 0, void 0, function* () {
        const fallbackResponse = {
            summary: "Summary generation in progress...",
            keyPoints: []
        };
        if (!process.env.GEMINI_API_KEY || !contextString.trim()) {
            console.warn("AI Digest bypassed: Missing GEMINI_API_KEY or empty context.");
            return fallbackResponse;
        }
        try {
            const prompt = `Act as an advanced knowledge extraction engine. Analyze the provided webpage context. Return a strict JSON response containing two keys: 'summary' (a concise 3-4-sentence overview) and 'keyPoints' (an array of exactly 4-5 high-impact, actionable bullet points). Do not include raw markdown wrap codes or filler text.
        
Context to analyze:
${contextString}`;
            const response = yield genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            const textOutput = response.text || '';
            try {
                const parsed = JSON.parse(textOutput);
                return {
                    summary: parsed.summary || fallbackResponse.summary,
                    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : fallbackResponse.keyPoints
                };
            }
            catch (parseError) {
                console.error("AI Digest JSON parse error:", parseError, "Raw Output:", textOutput);
                return fallbackResponse;
            }
        }
        catch (error) {
            console.error("AI Digest generation failed:", error.message);
            return fallbackResponse;
        }
    });
}
