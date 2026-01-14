"use strict";
// AI Service using Google Gemini
// Generates summaries, titles, and tags from extracted content
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeURL = analyzeURL;
exports.batchAnalyzeURLs = batchAnalyzeURLs;
exports.suggestNest = suggestNest;
const generative_ai_1 = require("@google/generative-ai");
const contentExtractor_1 = require("./contentExtractor");
// Initialize Gemini AI
let genAI = null;
function initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    if (!genAI) {
        genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    return genAI;
}
/**
 * Map content type to simplified type
 */
function mapToSimpleType(contentType) {
    if (contentType === 'youtube')
        return 'youtube';
    if (contentType === 'twitter')
        return 'twitter';
    if (contentType === 'github')
        return 'github';
    // For articles, check if it's dev.to
    return 'article';
}
/**
 * Minimum content length threshold for scraping
 * If content is shorter than this, we use URL-only fallback prompt
 */
const MIN_CONTENT_LENGTH = 100;
/**
 * Analyze URL and generate AI summary
 */
function analyzeURL(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        // Use gemini-2.5-flash for faster responses (under 5 seconds)
        const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        try {
            const extractedContent = yield (0, contentExtractor_1.extractContent)(url);
            const ai = initializeGemini();
            const model = ai.getGenerativeModel({
                model: MODEL_ID,
                // Force JSON response - no conversational filler
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            // Check if extracted content is empty or too short (common for Twitter/X, protected pages)
            const hasValidContent = extractedContent.text && extractedContent.text.trim().length >= MIN_CONTENT_LENGTH;
            let prompt;
            if (hasValidContent) {
                // Standard prompt with extracted content
                prompt = `Analyze this content and return a JSON object with "title", "summary" (5 sentences), and "tags" (3 specific words).
Content: ${extractedContent.text.slice(0, 8000)}`;
            }
            else {
                // URL-only fallback prompt for hard-to-scrape sites (Twitter/X, etc.)
                console.log(`⚠️ Content too short or empty for ${url}. Using URL-only fallback.`);
                prompt = `I could not read this website. Based on your internal knowledge of this URL: ${url}

Please provide a JSON object with:
- "title": A descriptive title for this link
- "summary": A 5-sentence summary based on what this URL likely contains
- "tags": 3 specific keyword tags

If you don't have specific knowledge about this URL, provide a reasonable summary based on the domain and URL structure.`;
            }
            console.log(`Using model: ${MODEL_ID}. Sending prompt...`);
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            const text = response.text();
            // Standard JSON parsing logic
            const aiData = JSON.parse(text);
            // Validate that we have required fields
            const title = aiData.title || extractedContent.title || new URL(url).hostname;
            const summary = aiData.summary || 'Summary not available for this content.';
            const tags = Array.isArray(aiData.tags) && aiData.tags.length > 0
                ? aiData.tags
                : ['Link'];
            return {
                title,
                summary,
                tags,
                type: mapToSimpleType(extractedContent.contentType),
                aiMetadata: {
                    model: MODEL_ID,
                    processingTime: Date.now() - startTime,
                    extractedContentLength: extractedContent.text.length
                }
            };
        }
        catch (error) {
            console.error('AI Analysis Error:', error);
            // Enhanced fallback: Return a "Partial" object with URL as title
            // This ensures the card is NEVER empty
            const processingTime = Date.now() - startTime;
            const contentType = (0, contentExtractor_1.detectContentType)(url);
            // Extract meaningful title from URL
            let fallbackTitle;
            try {
                const urlObj = new URL(url);
                // Use pathname last segment or hostname
                const pathSegments = urlObj.pathname.split('/').filter(Boolean);
                if (pathSegments.length > 0) {
                    // Clean up the last segment (remove file extensions, decode URI)
                    fallbackTitle = decodeURIComponent(pathSegments[pathSegments.length - 1])
                        .replace(/[-_]/g, ' ')
                        .replace(/\.[^.]+$/, ''); // Remove file extension
                }
                else {
                    fallbackTitle = urlObj.hostname;
                }
            }
            catch (_a) {
                fallbackTitle = url;
            }
            return {
                title: fallbackTitle || url,
                summary: 'AI analysis could not be completed for this link. The content may be protected or unavailable.',
                tags: ['Saved Link'],
                type: mapToSimpleType(contentType),
                aiMetadata: {
                    model: 'fallback',
                    processingTime,
                    extractedContentLength: 0
                }
            };
        }
    });
}
/**
 * Batch analyze multiple URLs
 */
function batchAnalyzeURLs(urls) {
    return __awaiter(this, void 0, void 0, function* () {
        // Process up to 10 URLs in parallel
        const maxParallel = 5;
        const results = [];
        for (let i = 0; i < urls.length; i += maxParallel) {
            const batch = urls.slice(i, i + maxParallel);
            const batchResults = yield Promise.allSettled(batch.map(url => analyzeURL(url)));
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    // Push error result
                    console.error('Batch analysis error:', result.reason);
                    results.push({
                        title: 'Analysis Failed',
                        summary: 'Failed to analyze this URL',
                        tags: ['Error'],
                        type: 'other',
                        aiMetadata: {
                            model: 'error',
                            processingTime: 0,
                            extractedContentLength: 0
                        }
                    });
                }
            }
        }
        return results;
    });
}
/**
 * Suggest best nest for content based on existing nests
 */
function suggestNest(content, nests) {
    return __awaiter(this, void 0, void 0, function* () {
        if (nests.length === 0) {
            return null; // No nests to suggest
        }
        try {
            const ai = initializeGemini();
            const model = ai.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-pro'
            });
            const prompt = `
You are helping organize content into folders (called "Nests"). 

New Content:
Title: ${content.title}
Summary: ${content.summary}
Tags: ${content.tags.join(', ')}

Available Nests:
${nests.map((nest, i) => `${i + 1}. "${nest.name}"${nest.description ? ` - ${nest.description}` : ''}`).join('\n')}

Which nest would be the best fit for this content? 

Respond with ONLY the nest number (1-${nests.length}), or "0" if none are a good match.
Example responses: "1", "3", "0"
`;
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            // Check if response has text
            if (!response || !response.text) {
                console.error('Empty response from Gemini for nest suggestion');
                return null;
            }
            const text = response.text().trim();
            // Parse response
            const nestIndex = parseInt(text);
            if (isNaN(nestIndex) || nestIndex < 1 || nestIndex > nests.length) {
                return null; // No good match
            }
            return nests[nestIndex - 1]._id;
        }
        catch (error) {
            console.error('Nest suggestion error:', error);
            return null;
        }
    });
}
