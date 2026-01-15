// Content Service - Frontend client for link management
import axios from 'axios';
import { BACKEND_URL } from '../Config';

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

/**
 * Extract metadata from a URL
 */
export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/extract`,
            { url },
            {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                },
                timeout: 10000 // 10 second timeout
            }
        );

        return response.data.metadata;
    } catch (error: any) {
        console.error('Metadata extraction error:', error);

        // Return fallback metadata
        const domain = extractDomainFromUrl(url);
        const platform = detectPlatform(url);
        return {
            title: domain,
            description: `Content from ${domain}`,
            image: null,
            siteName: domain,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            domain,
            contentType: platform === 'article' ? 'article' : platform,
            platform,
            isRichMedia: ['youtube', 'twitter', 'instagram'].includes(platform),
            extractionTime: 0
        };
    }
}

/**
 * Save content to database
 */
export async function saveContent(data: {
    link: string;
    title: string;
    type: string;
    tags?: string[];
    description?: string;
    image?: string | null;
    nestId?: string | null;
}): Promise<void> {
    try {
        await axios.post(
            `${BACKEND_URL}/api/v1/content`,
            data,
            {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            }
        );
    } catch (error) {
        console.error('Save content error:', error);
        throw new Error('Failed to save content');
    }
}

/**
 * Helper to extract domain from URL
 */
function extractDomainFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/**
 * Detect platform from URL (client-side helper)
 */
export function detectPlatform(url: string): ExtractedMetadata['platform'] {
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
