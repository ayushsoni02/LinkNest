// Content Extractor Service
// Extracts text content from various URL types (articles, YouTube, Twitter, etc.)
import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';

export interface ExtractedContent {
    text: string;
    title?: string;
    author?: string;
    publishedDate?: string;
    contentType: 'article' | 'youtube' | 'twitter' | 'github' | 'other';
}

/**
 * Detect content type from URL
 */
export function detectContentType(url: string): ExtractedContent['contentType'] {
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
        return 'twitter';
    } else if (lowercaseUrl.includes('github.com')) {
        return 'github';
    }

    return 'article';
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Extract YouTube transcript
 */
/**
 * Enhanced YouTube extraction
 */
async function extractYouTubeContent(url: string): Promise<ExtractedContent> {
    try {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        // 1. Fetch Metadata (Title & Thumbnail) without an API key
        let title = 'YouTube Video';
        let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        try {
            const metaResponse = await axios.get(`https://noembed.com/embed?url=${url}`);
            if (metaResponse.data && metaResponse.data.title) {
                title = metaResponse.data.title;
            }
        } catch (metaError) {
            console.warn('Metadata fetch failed, using defaults');
        }

        // 2. Fetch Transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const text = transcript.map(item => item.text).join(' ');

        return {
            text: text.slice(0, 15000), // Gemini 3 can handle more, so 15k is safe
            title: title,
            contentType: 'youtube',
            // thumbnail is optional in your interface, add it if you update ExtractedContent
        };
    } catch (error) {
        console.error('YouTube extraction error:', error);
        return {
            text: 'Transcript unavailable. Please check if captions are enabled for this video.',
            title: 'YouTube Video',
            contentType: 'youtube'
        };
    }
}

/**
 * Extract article content from web page
 */
async function extractArticleContent(url: string): Promise<ExtractedContent> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
            },
            timeout: 15000 // Increase timeout to 15 seconds
        });

        // axios throws on non-2xx, so no need to check response.ok
        const html = response.data;
        const $ = cheerio.load(html);

        // Remove script, style, and nav elements
        $('script, style, nav, footer, header, iframe, noscript').remove();

        // Try to get title
        const title = $('title').text() ||
            $('meta[property="og:title"]').attr('content') ||
            $('h1').first().text();

        // Try to get author
        const author = $('meta[name="author"]').attr('content') ||
            $('meta[property="article:author"]').attr('content');

        // Try to get main content
        let text = '';

        // Try common article containers
        const articleSelectors = [
            'article',
            '[role="main"]',
            '.post-content',
            '.article-content',
            '.entry-content',
            'main'
        ];

        for (const selector of articleSelectors) {
            const content = $(selector).text();
            if (content && content.length > text.length) {
                text = content;
            }
        }

        // Fallback to body if no article container found
        if (!text || text.length < 100) {
            text = $('body').text();
        }

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        return {
            text: text.slice(0, 15000), // Limit to 15k chars
            title: title?.trim(),
            author: author?.trim(),
            contentType: 'article'
        };
    } catch (error) {
        console.error('Article extraction error:', error);
        throw new Error('Failed to extract article content');
    }
}

/**
 * Extract Twitter/X thread content
 */
async function extractTwitterContent(url: string): Promise<ExtractedContent> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
            },
            timeout: 15000 // Increase timeout to 15 seconds
        });

        // axios throws on non-2xx, so no need to check response.ok
        const html = response.data;
        const $ = cheerio.load(html);

        // Get title (usually the first tweet text)
        const title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content');

        // Get description (tweet text)
        const description = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');

        return {
            text: description || 'Twitter content',
            title: title?.trim(),
            contentType: 'twitter'
        };
    } catch (error) {
        console.error('Twitter extraction error:', error);
        return {
            text: 'Unable to extract Twitter content. The tweet may be private or deleted.',
            contentType: 'twitter'
        };
    }
}

/**
 * Extract GitHub repository content
 */
async function extractGitHubContent(url: string): Promise<ExtractedContent> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
            },
            timeout: 15000 // Increase timeout to 15 seconds
        });

        // axios throws on non-2xx, so no need to check response.ok
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content');
        const description = $('meta[property="og:description"]').attr('content');

        // Try to get README content
        const readmeContent = $('.markdown-body').first().text() || '';

        const text = `${description || ''}\n\n${readmeContent}`.trim();

        return {
            text: text.slice(0, 10000),
            title: title?.trim(),
            contentType: 'github'
        };
    } catch (error) {
        console.error('GitHub extraction error:', error);
        throw new Error('Failed to extract GitHub content');
    }
}

/**
 * Main extraction function
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
    const contentType = detectContentType(url);

    switch (contentType) {
        case 'youtube':
            return await extractYouTubeContent(url);
        case 'twitter':
            return await extractTwitterContent(url);
        case 'github':
            return await extractGitHubContent(url);
        case 'article':
        default:
            return await extractArticleContent(url);
    }
}
