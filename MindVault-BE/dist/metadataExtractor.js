"use strict";
// High-Speed Metadata Extraction Service
// Extracts Open Graph metadata, favicon, and generates fallback thumbnails
// Target: < 500ms response time
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
exports.extractMetadata = extractMetadata;
exports.batchExtractMetadata = batchExtractMetadata;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
// Stealth headers to avoid blocking
const STEALTH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};
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
    else if (lowercaseUrl.includes('instagram.com')) {
        return 'instagram';
    }
    else if (lowercaseUrl.includes('substack.com')) {
        return 'substack';
    }
    else if (lowercaseUrl.includes('medium.com')) {
        return 'medium';
    }
    return 'article';
}
/**
 * Detect platform for frontend preview component selection
 */
function detectPlatform(contentType) {
    switch (contentType) {
        case 'youtube':
        case 'twitter':
        case 'instagram':
        case 'github':
        case 'substack':
        case 'medium':
            return contentType;
        default:
            return 'article';
    }
}
/**
 * Check if content type is rich media (larger card in Bento grid)
 */
function isRichMedia(contentType) {
    return ['youtube', 'instagram', 'twitter'].includes(contentType);
}
/**
 * Extract domain from URL
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    }
    catch (_a) {
        return url;
    }
}
/**
 * Generate favicon URL from domain
 */
function getFaviconUrl(domain) {
    // Using Google's favicon service for reliability
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
/**
 * Generate placeholder thumbnail for sites that block scraping
 */
function generatePlaceholderImage(domain, contentType) {
    // Use a placeholder image service with the domain name
    const encodedDomain = encodeURIComponent(domain);
    const bgColors = {
        twitter: '1DA1F2',
        youtube: 'FF0000',
        github: '24292E',
        instagram: 'E4405F',
        article: '6366F1',
        other: '64748B'
    };
    const bgColor = bgColors[contentType] || '64748B';
    // Using placeholder.com for generating branded placeholders
    return `https://via.placeholder.com/1200x630/${bgColor}/FFFFFF?text=${encodedDomain}`;
}
/**
 * Extract YouTube video ID and get thumbnail
 */
function getYouTubeThumbnail(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
    }
    return null;
}
/**
 * Main metadata extraction function
 * Target response time: < 500ms
 */
function extractMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        const contentType = detectContentType(url);
        const domain = extractDomain(url);
        const favicon = getFaviconUrl(domain);
        // Default fallback metadata
        const fallbackMetadata = {
            title: domain,
            description: `Content from ${domain}`,
            image: generatePlaceholderImage(domain, contentType),
            siteName: domain,
            favicon,
            domain,
            contentType,
            platform: detectPlatform(contentType),
            isRichMedia: isRichMedia(contentType),
            extractionTime: 0
        };
        try {
            // Special handling for YouTube - direct thumbnail extraction
            if (contentType === 'youtube') {
                const ytThumbnail = getYouTubeThumbnail(url);
                // Quick metadata fetch with aggressive timeout
                const response = yield axios_1.default.get(url, {
                    headers: STEALTH_HEADERS,
                    timeout: 3000, // 3 second timeout
                    maxRedirects: 3
                });
                const $ = cheerio.load(response.data);
                return {
                    title: $('meta[property="og:title"]').attr('content') ||
                        $('title').text() ||
                        'YouTube Video',
                    description: $('meta[property="og:description"]').attr('content') ||
                        $('meta[name="description"]').attr('content') ||
                        'Watch this video on YouTube',
                    image: ytThumbnail || $('meta[property="og:image"]').attr('content') || fallbackMetadata.image,
                    siteName: 'YouTube',
                    favicon,
                    domain,
                    contentType,
                    platform: 'youtube',
                    isRichMedia: true,
                    extractionTime: Date.now() - startTime
                };
            }
            // For Twitter/X - use fallback immediately (they block scraping)
            if (contentType === 'twitter') {
                return Object.assign(Object.assign({}, fallbackMetadata), { title: 'Post on X', description: 'View this post on X (Twitter)', siteName: 'X (Twitter)', extractionTime: Date.now() - startTime });
            }
            // For Instagram - use fallback (they block scraping)
            if (contentType === 'instagram') {
                return Object.assign(Object.assign({}, fallbackMetadata), { title: 'Instagram Post', description: 'View this post on Instagram', siteName: 'Instagram', extractionTime: Date.now() - startTime });
            }
            // Standard scraping for other sites
            const response = yield axios_1.default.get(url, {
                headers: STEALTH_HEADERS,
                timeout: 3000, // 3 second timeout
                maxRedirects: 3
            });
            const $ = cheerio.load(response.data);
            // Extract Open Graph metadata
            const ogTitle = $('meta[property="og:title"]').attr('content');
            const ogDescription = $('meta[property="og:description"]').attr('content');
            const ogImage = $('meta[property="og:image"]').attr('content');
            const ogSiteName = $('meta[property="og:site_name"]').attr('content');
            // Fallback to standard meta tags
            const title = ogTitle ||
                $('meta[name="title"]').attr('content') ||
                $('title').text().trim() ||
                domain;
            const description = ogDescription ||
                $('meta[name="description"]').attr('content') ||
                $('p').first().text().slice(0, 200) ||
                `Content from ${domain}`;
            // Handle relative image URLs
            let image = ogImage || $('meta[name="twitter:image"]').attr('content');
            if (image && !image.startsWith('http')) {
                try {
                    const baseUrl = new URL(url);
                    image = new URL(image, baseUrl.origin).href;
                }
                catch (_a) {
                    image = undefined;
                }
            }
            return {
                title: title.slice(0, 200), // Limit title length
                description: description.slice(0, 500), // Limit description
                image: image || fallbackMetadata.image,
                siteName: ogSiteName || domain,
                favicon,
                domain,
                contentType,
                platform: detectPlatform(contentType),
                isRichMedia: isRichMedia(contentType),
                extractionTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.warn(`Metadata extraction failed for ${url}:`, error.message);
            // Return fallback with timing
            return Object.assign(Object.assign({}, fallbackMetadata), { extractionTime: Date.now() - startTime });
        }
    });
}
/**
 * Batch extract metadata for multiple URLs
 */
function batchExtractMetadata(urls) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.allSettled(urls.map(url => extractMetadata(url)));
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            // Return fallback for failed extractions
            const domain = extractDomain(urls[index]);
            const contentType = detectContentType(urls[index]);
            return {
                title: domain,
                description: `Content from ${domain}`,
                image: generatePlaceholderImage(domain, contentType),
                siteName: domain,
                favicon: getFaviconUrl(domain),
                domain,
                contentType,
                platform: detectPlatform(contentType),
                isRichMedia: isRichMedia(contentType),
                extractionTime: 0
            };
        });
    });
}
