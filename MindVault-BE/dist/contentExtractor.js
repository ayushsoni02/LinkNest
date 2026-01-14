"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.detectContentType = detectContentType;
exports.extractContent = extractContent;
// Content Extractor Service
// Extracts text content from various URL types (articles, YouTube, Twitter, etc.)
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const youtube_transcript_1 = require("youtube-transcript");
/**
 * Detect content type from URL
 */
function detectContentType(url) {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
        return 'youtube';
    }
    else if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
        return 'twitter';
    }
    else if (lowercaseUrl.includes('github.com')) {
        return 'github';
    }
    return 'article';
}
/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url) {
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
function extractYouTubeContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const videoId = extractYouTubeVideoId(url);
            if (!videoId)
                throw new Error('Invalid YouTube URL');
            // 1. Fetch Metadata (Title & Thumbnail) without an API key
            let title = 'YouTube Video';
            let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            try {
                const metaResponse = yield axios_1.default.get(`https://noembed.com/embed?url=${url}`);
                if (metaResponse.data && metaResponse.data.title) {
                    title = metaResponse.data.title;
                }
            }
            catch (metaError) {
                console.warn('Metadata fetch failed, using defaults');
            }
            // 2. Fetch Transcript
            const transcript = yield youtube_transcript_1.YoutubeTranscript.fetchTranscript(videoId);
            const text = transcript.map(item => item.text).join(' ');
            return {
                text: text.slice(0, 15000), // Gemini 3 can handle more, so 15k is safe
                title: title,
                contentType: 'youtube',
                // thumbnail is optional in your interface, add it if you update ExtractedContent
            };
        }
        catch (error) {
            console.error('YouTube extraction error:', error);
            return {
                text: 'Transcript unavailable. Please check if captions are enabled for this video.',
                title: 'YouTube Video',
                contentType: 'youtube'
            };
        }
    });
}
/**
 * Extract article content from web page
 */
function extractArticleContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, {
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
                title: title === null || title === void 0 ? void 0 : title.trim(),
                author: author === null || author === void 0 ? void 0 : author.trim(),
                contentType: 'article'
            };
        }
        catch (error) {
            console.error('Article extraction error:', error);
            throw new Error('Failed to extract article content');
        }
    });
}
/**
 * Extract Twitter/X thread content
 */
function extractTwitterContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, {
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
                title: title === null || title === void 0 ? void 0 : title.trim(),
                contentType: 'twitter'
            };
        }
        catch (error) {
            console.error('Twitter extraction error:', error);
            return {
                text: 'Unable to extract Twitter content. The tweet may be private or deleted.',
                contentType: 'twitter'
            };
        }
    });
}
/**
 * Extract GitHub repository content
 */
function extractGitHubContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, {
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
                title: title === null || title === void 0 ? void 0 : title.trim(),
                contentType: 'github'
            };
        }
        catch (error) {
            console.error('GitHub extraction error:', error);
            throw new Error('Failed to extract GitHub content');
        }
    });
}
/**
 * Main extraction function
 */
function extractContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentType = detectContentType(url);
        switch (contentType) {
            case 'youtube':
                return yield extractYouTubeContent(url);
            case 'twitter':
                return yield extractTwitterContent(url);
            case 'github':
                return yield extractGitHubContent(url);
            case 'article':
            default:
                return yield extractArticleContent(url);
        }
    });
}
