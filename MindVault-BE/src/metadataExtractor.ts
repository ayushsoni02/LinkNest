// High-Speed Metadata Extraction Service
// Extracts Open Graph metadata, favicon, and generates fallback thumbnails
// Target: < 500ms response time

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ExtractedMetadata {
    title: string;
    description: string;
    image: string | null;
    siteName: string;
    favicon: string;
    domain: string;
    contentType: 'youtube' | 'twitter' | 'github' | 'instagram' | 'substack' | 'medium' | 'article' | 'other';
    platform: 'youtube' | 'twitter' | 'instagram' | 'github' | 'substack' | 'medium' | 'article';
    isRichMedia: boolean;
    extractionTime: number;
}

// Stealth headers to avoid blocking
const STEALTH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

/**
 * Detect content type from URL
 */
function detectContentType(url: string): ExtractedMetadata['contentType'] {
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
        return 'twitter';
    } else if (lowercaseUrl.includes('github.com')) {
        return 'github';
    } else if (lowercaseUrl.includes('instagram.com')) {
        return 'instagram';
    } else if (lowercaseUrl.includes('substack.com')) {
        return 'substack';
    } else if (lowercaseUrl.includes('medium.com')) {
        return 'medium';
    }

    return 'article';
}

/**
 * Detect platform for frontend preview component selection
 */
function detectPlatform(contentType: ExtractedMetadata['contentType']): ExtractedMetadata['platform'] {
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
function isRichMedia(contentType: ExtractedMetadata['contentType']): boolean {
    return ['youtube', 'instagram', 'twitter'].includes(contentType);
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/**
 * Generate favicon URL from domain
 */
function getFaviconUrl(domain: string): string {
    // Using Google's favicon service for reliability
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * Generate placeholder thumbnail for sites that block scraping
 */
function generatePlaceholderImage(domain: string, contentType: ExtractedMetadata['contentType']): string {
    // Use a placeholder image service with the domain name
    const encodedDomain = encodeURIComponent(domain);
    const bgColors: Record<string, string> = {
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
function getYouTubeThumbnail(url: string): string | null {
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
export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
    const startTime = Date.now();
    const contentType = detectContentType(url);
    const domain = extractDomain(url);
    const favicon = getFaviconUrl(domain);

    // Default fallback metadata
    const fallbackMetadata: ExtractedMetadata = {
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
        // Special handling for YouTube - Use fast oEmbed API (<150ms)
        if (contentType === 'youtube') {
            try {
                // Fetch oEmbed JSON to bypass dynamic JS hydration
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const response = await axios.get(oembedUrl, {
                    timeout: 2000,
                });
                
                const data = response.data;
                
                return {
                    title: data.title || fallbackMetadata.title,
                    description: data.author_name ? `A video content item created by ${data.author_name}` : fallbackMetadata.description,
                    image: data.thumbnail_url || fallbackMetadata.image,
                    siteName: data.provider_name || 'YouTube',
                    favicon,
                    domain,
                    contentType,
                    platform: 'youtube',
                    isRichMedia: true,
                    extractionTime: Date.now() - startTime
                };
            } catch (ytError: any) {
                console.warn('YouTube oEmbed failed, falling back to basic extraction:', ytError.message);
                // Fallback will happen naturally if an error is thrown
                throw ytError;
            }
        }

        // For Twitter/X - use fallback immediately (they block scraping)
        if (contentType === 'twitter') {
            return {
                ...fallbackMetadata,
                title: 'Post on X',
                description: 'View this post on X (Twitter)',
                siteName: 'X (Twitter)',
                extractionTime: Date.now() - startTime
            };
        }

        // For Instagram - use fallback (they block scraping)
        if (contentType === 'instagram') {
            return {
                ...fallbackMetadata,
                title: 'Instagram Post',
                description: 'View this post on Instagram',
                siteName: 'Instagram',
                extractionTime: Date.now() - startTime
            };
        }

        // Standard scraping for other sites using fetch to bypass 403s
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
            headers: STEALTH_HEADERS,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Open Graph and Twitter metadata with better fallbacks
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('meta[name="twitter:title"]').attr('content') || 
                      $('h1').first().text() ||
                      $('title').text().trim() || 
                      'Untitled Article';

        let description = $('meta[property="og:description"]').attr('content') || 
                          $('meta[name="twitter:description"]').attr('content') || 
                          '';

        // Extract context body
        const articleContent = $('article').text() || $('main').text() || $('p').slice(0, 5).text();
        const sanitizedContext = articleContent.replace(/\s+/g, ' ').trim().slice(0, 2000);

        if (sanitizedContext) {
            description = sanitizedContext;
        } else if (!description) {
            description = `Content from ${domain}`;
        }

        // Handle relative image URLs
        let image: string | undefined = $('meta[property="og:image"]').attr('content') || 
                                        $('meta[name="twitter:image"]').attr('content');
                                        
        if (image && !image.startsWith('http')) {
            try {
                const baseUrl = new URL(url);
                image = new URL(image, baseUrl.origin).href;
            } catch {
                image = undefined;
            }
        }

        return {
            title: title.slice(0, 200), // Limit title length
            description: description.slice(0, 500), // Limit description
            image: image || fallbackMetadata.image,
            siteName: $('meta[property="og:site_name"]').attr('content') || domain,
            favicon,
            domain,
            contentType,
            platform: detectPlatform(contentType),
            isRichMedia: isRichMedia(contentType),
            extractionTime: Date.now() - startTime
        };

    } catch (error: any) {
        console.warn(`Metadata extraction failed for ${url}:`, error.message);

        // Return fallback with timing
        return {
            ...fallbackMetadata,
            extractionTime: Date.now() - startTime
        };
    }
}

/**
 * Batch extract metadata for multiple URLs
 */
export async function batchExtractMetadata(urls: string[]): Promise<ExtractedMetadata[]> {
    const results = await Promise.allSettled(
        urls.map(url => extractMetadata(url))
    );

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
}
