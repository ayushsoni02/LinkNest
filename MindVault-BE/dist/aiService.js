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
 * Analyze URL and generate AI summary
 */
function analyzeURL(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            // Step 1: Extract content from URL
            const extractedContent = yield (0, contentExtractor_1.extractContent)(url);
            // Step 2: Initialize Gemini
            const ai = initializeGemini();
            const model = ai.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-pro',
                // Configure safety settings to be less restrictive
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_ONLY_HIGH'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_ONLY_HIGH'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_ONLY_HIGH'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_ONLY_HIGH'
                    }
                ]
            });
            console.log('Extracted content length:', extractedContent.text.length);
            console.log('Extracted content preview:', extractedContent.text.slice(0, 200));
            // Step 3: Create prompt for Gemini
            const prompt = `
You are an AI content analyzer for a link management app called LinkNest. Analyze the following content and provide structured output.

URL: ${url}
Content Type: ${extractedContent.contentType}
Content Title: ${extractedContent.title || 'Unknown'}

Content Text:
${extractedContent.text.slice(0, 5000)}

Please analyze this content and provide a JSON response with the following structure:
{
  "title": "A clear, concise title (max 80 characters)",
  "summary": "A comprehensive 5-sentence summary of the main points",
  "tags": ["tag1", "tag2", "tag3"]
}

Guidelines:
- Title should be descriptive and engaging
- Summary should be exactly 5 sentences, covering key insights
- Provide exactly 3 relevant tags (single words, capitalized)
- Tags should be specific to the content domain
- Keep response in valid JSON format

Respond with ONLY the JSON object, no additional text.
`;
            console.log('Sending prompt to Gemini...');
            // Step 4: Generate content with Gemini
            const result = yield model.generateContent(prompt);
            console.log('Received result from Gemini');
            const response = yield result.response;
            console.log('Response candidates:', JSON.stringify(response.candidates, null, 2));
            console.log('Response promptFeedback:', JSON.stringify(response.promptFeedback, null, 2));
            // Check for safety blocks or empty response
            if (!response.candidates || response.candidates.length === 0) {
                console.error('No candidates in response - content may be blocked');
                throw new Error('Content blocked by safety filters or no response generated');
            }
            const candidate = response.candidates[0];
            console.log('First candidate:', JSON.stringify(candidate, null, 2));
            // Check if response has text
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                console.error('No content parts in candidate');
                console.error('Finish reason:', candidate.finishReason);
                console.error('Safety ratings:', candidate.safetyRatings);
                throw new Error('Empty response from Gemini API - check finish reason and safety ratings above');
            }
            const text = candidate.content.parts[0].text;
            if (!text || text.trim() === '') {
                throw new Error('Empty text in Gemini response');
            }
            // Step 5: Parse AI response
            console.log('Raw Gemini response:', text);
            // Extract JSON from response (handle markdown code blocks)
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            let aiData;
            try {
                aiData = JSON.parse(jsonText);
            }
            catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Failed to parse:', jsonText);
                // Fallback: create basic object from extracted content
                aiData = {
                    title: extractedContent.title || 'Untitled',
                    summary: text.slice(0, 500) || 'No summary available',
                    tags: ['Uncategorized']
                };
            }
            // Step 6: Validate and construct result
            const processingTime = Date.now() - startTime;
            const type = mapToSimpleType(extractedContent.contentType);
            return {
                title: aiData.title || extractedContent.title || 'Untitled',
                summary: aiData.summary || 'No summary available',
                tags: Array.isArray(aiData.tags) ? aiData.tags.slice(0, 3) : [],
                type,
                aiMetadata: {
                    model: process.env.GEMINI_MODEL || 'gemini-pro',
                    processingTime,
                    extractedContentLength: extractedContent.text.length
                }
            };
        }
        catch (error) {
            console.error('AI Analysis Error:', error);
            // Fallback: Return basic info if AI fails
            const processingTime = Date.now() - startTime;
            const contentType = (0, contentExtractor_1.detectContentType)(url);
            return {
                title: url.split('/').pop() || 'Untitled Link',
                summary: 'AI analysis unavailable. Please add a summary manually.',
                tags: ['Uncategorized'],
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
