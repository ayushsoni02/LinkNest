// AI Service using Google Gemini
// Generates summaries, titles, and tags from extracted content

import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractContent, detectContentType } from './contentExtractor';

export interface AIAnalysisResult {
    title: string;
    summary: string;
    tags: string[];
    type: 'article' | 'youtube' | 'twitter' | 'github' | 'dev' | 'other';
    aiMetadata: {
        model: string;
        tokensUsed?: number;
        processingTime: number;
        extractedContentLength: number;
    };
}

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
    }

    return genAI;
}

/**
 * Map content type to simplified type
 */
function mapToSimpleType(contentType: string): AIAnalysisResult['type'] {
    if (contentType === 'youtube') return 'youtube';
    if (contentType === 'twitter') return 'twitter';
    if (contentType === 'github') return 'github';

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
export async function analyzeURL(url: string): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    // Use gemini-2.5-flash for faster responses (under 5 seconds)
    const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    try {
        const extractedContent = await extractContent(url);
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

        let prompt: string;

        if (hasValidContent) {
            // Standard prompt with extracted content
            prompt = `Analyze this content and return a JSON object with "title", "summary" (5 sentences), and "tags" (3 specific words).
Content: ${extractedContent.text.slice(0, 8000)}`;
        } else {
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
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
    } catch (error: any) {
        console.error('AI Analysis Error:', error);

        // Enhanced fallback: Return a "Partial" object with URL as title
        // This ensures the card is NEVER empty
        const processingTime = Date.now() - startTime;
        const contentType = detectContentType(url);

        // Extract meaningful title from URL
        let fallbackTitle: string;
        try {
            const urlObj = new URL(url);
            // Use pathname last segment or hostname
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            if (pathSegments.length > 0) {
                // Clean up the last segment (remove file extensions, decode URI)
                fallbackTitle = decodeURIComponent(pathSegments[pathSegments.length - 1])
                    .replace(/[-_]/g, ' ')
                    .replace(/\.[^.]+$/, ''); // Remove file extension
            } else {
                fallbackTitle = urlObj.hostname;
            }
        } catch {
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
}

/**
 * Batch analyze multiple URLs
 */
export async function batchAnalyzeURLs(urls: string[]): Promise<AIAnalysisResult[]> {
    // Process up to 10 URLs in parallel
    const maxParallel = 5;
    const results: AIAnalysisResult[] = [];

    for (let i = 0; i < urls.length; i += maxParallel) {
        const batch = urls.slice(i, i + maxParallel);
        const batchResults = await Promise.allSettled(
            batch.map(url => analyzeURL(url))
        );

        for (const result of batchResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
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
}

/**
 * Suggest best nest for content based on existing nests
 */
export async function suggestNest(
    content: { title: string; summary: string; tags: string[] },
    nests: { _id: string; name: string; description?: string }[]
): Promise<string | null> {
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

        const result = await model.generateContent(prompt);
        const response = await result.response;

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

    } catch (error) {
        console.error('Nest suggestion error:', error);
        return null;
    }
}
