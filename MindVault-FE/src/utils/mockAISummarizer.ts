// Mock AI Summarizer Service
// Simulates an AI API call that analyzes a URL and returns structured data

export interface AISummaryResult {
    title: string;
    summary: string;
    tags: string[];
    type: 'article' | 'youtube' | 'twitter' | 'dev' | 'other';
}

// Helper to detect content type from URL
const detectContentType = (url: string): AISummaryResult['type'] => {
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
        return 'twitter';
    } else if (lowercaseUrl.includes('dev.to')) {
        return 'dev';
    } else if (
        lowercaseUrl.includes('medium.com') ||
        lowercaseUrl.includes('blog') ||
        lowercaseUrl.includes('article')
    ) {
        return 'article';
    }

    return 'other';
};

// Helper to generate a title from URL
const generateTitleFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // Remove file extensions and special characters
        let title = pathname
            .split('/')
            .filter(Boolean)
            .pop() || urlObj.hostname;

        // Convert hyphens and underscores to spaces
        title = title.replace(/[-_]/g, ' ');

        // Capitalize first letter of each word
        title = title
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return title || 'Untitled Content';
    } catch {
        return 'Untitled Content';
    }
};

// Mock tag pools based on content type
const tagPools = {
    youtube: ['Tutorial', 'Video', 'Learning', 'Tech', 'Education', 'Guide'],
    twitter: ['Social', 'Discussion', 'Insights', 'News', 'Opinion'],
    dev: ['Development', 'Programming', 'Tech', 'Code', 'Tutorial'],
    article: ['Reading', 'Article', 'Blog', 'Knowledge', 'Research'],
    other: ['Web', 'Resource', 'Reference', 'Link', 'Content']
};

// Generate random tags from pool
const generateTags = (type: AISummaryResult['type']): string[] => {
    const pool = tagPools[type];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
};

// Generate a 5-sentence summary
const generateSummary = (title: string, type: AISummaryResult['type']): string => {
    const summaries = {
        youtube: [
            `This video tutorial provides comprehensive coverage of ${title.toLowerCase()}.`,
            'The presenter walks through key concepts with practical examples.',
            'Visual demonstrations make complex topics easy to understand.',
            'Viewers will gain hands-on knowledge applicable to real-world scenarios.',
            'Perfect for both beginners and experienced learners looking to deepen their understanding.'
        ],
        twitter: [
            `An insightful thread discussing ${title.toLowerCase()}.`,
            'The author shares unique perspectives backed by experience and data.',
            'Community engagement in the replies adds additional valuable context.',
            'This discussion highlights emerging trends and important considerations.',
            'Worth following for ongoing updates and related insights.'
        ],
        dev: [
            `A technical deep-dive into ${title.toLowerCase()}.`,
            'The article covers practical implementation details with code examples.',
            'Best practices and common pitfalls are thoroughly explained.',
            'Readers will learn optimization techniques and modern approaches.',
            'An essential read for developers working in this domain.'
        ],
        article: [
            `An engaging exploration of ${title.toLowerCase()}.`,
            'The author presents well-researched arguments supported by credible sources.',
            'Complex ideas are broken down into digestible sections.',
            'Readers will gain new perspectives on the topic.',
            'A must-read for anyone interested in this subject area.'
        ],
        other: [
            `A valuable resource about ${title.toLowerCase()}.`,
            'The content offers useful information and practical insights.',
            'Well-organized and easy to navigate.',
            'Provides reliable information for further exploration.',
            'A helpful reference for learning more about this topic.'
        ]
    };

    return summaries[type].join(' ');
};

/**
 * Mock AI Summarizer function
 * Simulates an API call with realistic delay and returns structured content data
 */
export const mockAISummarizer = async (url: string): Promise<AISummaryResult> => {
    // Validate URL
    if (!url || url.trim() === '') {
        throw new Error('Please enter a valid URL');
    }

    try {
        new URL(url);
    } catch {
        throw new Error('Invalid URL format. Please enter a complete URL (e.g., https://example.com)');
    }

    // Simulate API delay (1.5-2.5 seconds)
    const delay = 1500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock data
    const type = detectContentType(url);
    const title = generateTitleFromUrl(url);
    const tags = generateTags(type);
    const summary = generateSummary(title, type);

    return {
        title,
        summary,
        tags,
        type
    };
};
