# Environment Setup Guide

## Backend Environment Variables

The backend uses **Cloudflare Workers** with **Wrangler**, which has a specific way of handling environment variables and secrets.

### Local Development

For local development with `wrangler dev`, you need to create a `.dev.vars` file in the `backend/` directory:

```bash
# backend/.dev.vars
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important:** The `.dev.vars` file is gitignored and should never be committed to version control.

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.dev.vars` file

### Production Deployment

For production, you need to set secrets using the Wrangler CLI:

```bash
cd backend
npx wrangler secret put GEMINI_API_KEY
# You'll be prompted to enter your API key
```

## Frontend Environment Variables

The frontend uses **Vite**, which requires environment variables to be prefixed with `VITE_`.

### Setup

1. A `.env` file has been created in the root directory with:
   ```bash
   VITE_API_URL=http://localhost:8787
   ```

2. For production, update this to your deployed backend URL:
   ```bash
   VITE_API_URL=https://your-backend.workers.dev
   ```

### Accessing in Code

In your React/TypeScript code, access environment variables using:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Files Created

- ✅ `backend/.env` - Backend environment variables (for reference)
- ✅ `backend/.env.example` - Backend template with instructions
- ✅ `.env` - Frontend environment variables
- ✅ `.env.example` - Frontend template
- ✅ Updated `.gitignore` to exclude `.env`, `.dev.vars`, and `.wrangler`
- ✅ Updated `wrangler.toml` with environment variable configuration

## Next Steps

1. **Create `backend/.dev.vars`** manually with your actual Gemini API key
2. Restart your development server to load the new environment variables
3. When deploying to production, use `wrangler secret put GEMINI_API_KEY`
