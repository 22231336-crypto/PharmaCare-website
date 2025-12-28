# Deployment Guide

## Deploy to GitHub Pages

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add homepage to package.json**
   Add this line to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/pharmacy-store",
   ```

3. **Add deployment scripts to package.json**
   Add these scripts to the `scripts` section:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

4. **Deploy the application**
   ```bash
   npm run deploy
   ```

## Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Or simply connect your GitHub repo to Vercel's dashboard.

## Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy using Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```
   Or drag and drop the `build` folder to Netlify's dashboard.

## Environment Variables

For production, you may need to set environment variables:
- Create a `.env.production` file
- Add variables prefixed with `REACT_APP_`
- Example:
  ```
  REACT_APP_API_URL=https://api.pharmacare.com
  ```

## Build Optimization

To create an optimized production build:
```bash
npm run build
```

The build folder will contain minified files ready for deployment.
