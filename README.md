# GlobalTravel.com ITA Help Center

AI-powered support assistant for Independent Travel Agents.

## Project Structure

```
globaltravel-help-center/
├── netlify/
│   └── functions/
│       └── chat.js          ← Serverless function (API key lives here securely)
├── src/
│   ├── App.jsx              ← Main React app (UI + chat logic)
│   └── index.js             ← React entry point
├── public/
│   └── index.html           ← HTML shell
├── knowledge-base.txt       ← ⭐ EDIT THIS to update knowledge base
├── netlify.toml             ← Netlify build config
└── package.json             ← Dependencies
```

## Updating the Knowledge Base

1. Open `knowledge-base.txt` in GitHub (click the file → pencil icon to edit)
2. Make your changes
3. Click **Commit changes**
4. Netlify auto-deploys in ~60 seconds

No code changes needed. No redeploy button to click.

## Netlify Setup

1. Connect this GitHub repo to Netlify
2. Netlify will auto-detect the build settings from `netlify.toml`
3. Go to **Site Settings → Environment Variables**
4. Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com

## Local Development

```bash
npm install
npm start
```

Note: The Netlify function won't work locally without `netlify dev`. For local testing, the Claude.ai artifact version can be used instead.

## Cost Estimates (with prompt caching)

- Per question: ~$0.004
- 250,000 questions/month: ~$1,000/month
- Caching saves ~80% vs uncached ($5,500/month)
