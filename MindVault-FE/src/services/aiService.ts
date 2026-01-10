// AI Service - Frontend client for AI endpoints
import axios from 'axios';
import { BACKEND_URL } from '../Config';

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

export interface BatchAnalysisResult extends AIAnalysisResult {
    url: string;
    success: boolean;
    error?: string;
}

/**
 * Analyze a single URL with AI
 */
export async function analyzeURL(url: string): Promise<AIAnalysisResult> {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/ai/analyze`,
            { url },
            {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            }
        );

        return response.data.analysis;
    } catch (error: any) {
        console.error('AI analysis error:', error);
        throw new Error(
            error.response?.data?.message || 'Failed to analyze URL. Please try again.'
        );
    }
}

/**
 * Batch analyze multiple URLs
 */
export async function batchAnalyzeURLs(urls: string[]): Promise<BatchAnalysisResult[]> {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/ai/batch-analyze`,
            { urls },
            {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            }
        );

        // Combine URLs with results
        return response.data.results.map((result: AIAnalysisResult, index: number) => ({
            ...result,
            url: urls[index],
            success: result.title !== 'Analysis Failed'
        }));
    } catch (error: any) {
        console.error('Batch analysis error:', error);
        throw new Error(
            error.response?.data?.message || 'Failed to batch analyze URLs.'
        );
    }
}

/**
 * Get AI-suggested nest for content
 */
export async function suggestNest(
    title: string,
    summary: string,
    tags: string[]
): Promise<string | null> {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/ai/suggest-nest`,
            { title, summary, tags },
            {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            }
        );

        return response.data.suggestedNestId;
    } catch (error) {
        console.error('Nest suggestion error:', error);
        return null;
    }
}

/**
 * Save content with AI-generated data
 */
export async function saveContent(data: {
    link: string;
    title: string;
    type: string;
    tags: string[];
    summary?: string;
    aiMetadata?: any;
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
