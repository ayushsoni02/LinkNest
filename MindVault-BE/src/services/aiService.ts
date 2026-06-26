import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
});

interface DigestResult {
    summary: string;
    keyPoints: string[];
}

/**
 * Generates a concise summary and key takeaways using the Gemini API.
 * @param contextString The extracted text or dynamic description to summarize.
 * @returns A structured DigestResult object.
 */
export async function generateLinkDigest(contextString: string): Promise<DigestResult> {
    const fallbackResponse: DigestResult = {
        summary: "Summary generation in progress...",
        keyPoints: []
    };

    if (!process.env.GEMINI_API_KEY || !contextString.trim()) {
        console.warn("AI Digest bypassed: Missing GEMINI_API_KEY or empty context.");
        return fallbackResponse;
    }

    try {
        const prompt = `Act as an advanced knowledge extraction engine. Analyze the provided webpage context. Return a strict JSON response containing two keys: 'summary' (a concise 3-4-sentence overview) and 'keyPoints' (an array of exactly 4-5 high-impact, actionable bullet points). Do not include raw markdown wrap codes or filler text.
        
If the incoming context description mentions a long-form article title or a social graph platform post wrapper instead of full body text, utilize semantic analysis of the Title string to infer the overarching domain topic, generating high-level structured takeaways matching that engineering topic.

Context to analyze:
${contextString}`;

        const response = await genai.models.generateContent({
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
        } catch (parseError) {
            console.error("AI Digest JSON parse error:", parseError, "Raw Output:", textOutput);
            return fallbackResponse;
        }

    } catch (error: any) {
        console.error("AI Digest generation failed:", error.message);
        return fallbackResponse;
    }
}
