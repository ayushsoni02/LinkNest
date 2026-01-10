# Setting Up Gemini AI Integration

## Prerequisites
- Google Cloud account
- Gemini API key

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

## Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd MindVault-BE
   ```

2. Create or update `.env` file with your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   MAX_TOKENS=1000
   RATE_LIMIT_PER_USER=5
   ```


3. Make sure all other `.env` variables are set (see `.env.example`)

## Step 3: Rebuild and Restart Backend

```bash
npm run build
npm run dev
```

## Step 4: Test the AI Integration

1. Open your frontend (http://localhost:5173)
2. Log in to your account
3. Paste a URL in the Universal Add input
4. Watch the AI analyze and generate:
   - Title
   - Summary (5 sentences)
   - Tags (3 relevant tags)
   - Suggested Nest (if you have nests)

## Features Available

### 1. Single URL Analysis
- Paste any URL
- AI extracts content and generates metadata
- Preview and edit before saving
- Smart nest suggestion

### 2. Batch Import
- Click "Batch Import Multiple URLs"
- Paste up to 10 URLs (line-separated)
- AI processes all in parallel
- Review results and save all at once

### 3. Content Extraction
- **YouTube**: Fetches video transcripts
- **Articles**: Extracts main text content
- **Twitter**: Grabs tweet/thread text
- **GitHub**: Parses README content

### 4. Rate Limiting
- 5 AI requests per minute per user (configurable)
- Prevents API cost overruns

## Troubleshooting

### "GEMINI_API_KEY is not set"
- Make sure your `.env` file is in the `MindVault-BE` directory
- Restart the backend server after adding the key

### "Failed to analyze URL"
- Check if URL is accessible (not behind paywall)
- Some sites block automated access
- YouTube transcripts may not be available for all videos

### Rate Limit Errors
- Wait 60 seconds before trying again
- Or adjust `RATE_LIMIT_PER_USER` in `.env`

## API Costs

Gemini API usage is charged by Google. Monitor your usage at:
https://ai.google.dev/pricing

Current configuration limits:
- Rate limit: 5 requests/minute/user
- Max tokens per request: 1000
- Content extraction limit: 15,000 characters per URL
