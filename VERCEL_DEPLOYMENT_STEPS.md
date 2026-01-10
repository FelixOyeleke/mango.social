# Vercel Deployment Steps

## Prerequisites
✅ Backend is deployed on Render and running
✅ GitHub repository is up to date
✅ You have a Vercel account (sign up at https://vercel.com)

## Step 1: Update Environment Variables

1. **Get your Render backend URL**
   - Go to your Render dashboard
   - Find your backend service (immigrant-voices-api)
   - Copy the URL (e.g., `https://immigrant-voices-api.onrender.com`)

2. **Update `client/.env.production`**
   ```env
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

## Step 2: Deploy to Vercel (Option A - CLI)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy
```bash
# From project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? mango-social (or your preferred name)
# - In which directory is your code located? ./
# - Want to override the settings? Yes
#   - Build Command: cd client && npm install && npm run build
#   - Output Directory: client/dist
#   - Development Command: cd client && npm run dev
```

### Set Environment Variables
```bash
vercel env add VITE_API_URL production
# Enter your Render backend URL when prompted
```

### Deploy to Production
```bash
vercel --prod
```

## Step 3: Deploy to Vercel (Option B - Dashboard)

### 1. Import Project
- Go to https://vercel.com/new
- Click "Import Git Repository"
- Select your GitHub repository
- Click "Import"

### 2. Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install --prefix client`

### 3. Add Environment Variables
- Click "Environment Variables"
- Add:
  - **Name**: `VITE_API_URL`
  - **Value**: `https://your-render-backend-url.onrender.com`
  - **Environment**: Production, Preview, Development (select all)

### 4. Deploy
- Click "Deploy"
- Wait for build to complete (usually 1-2 minutes)

## Step 4: Update Backend CORS Settings

After deployment, you need to update your backend to allow requests from Vercel:

1. **Get your Vercel URL** (e.g., `https://mango-social.vercel.app`)

2. **Update Render Environment Variables**
   - Go to Render dashboard
   - Select your backend service
   - Go to "Environment"
   - Update `CLIENT_URL` to your Vercel URL
   - Save changes (this will trigger a redeploy)

## Step 5: Verify Deployment

1. **Visit your Vercel URL**
2. **Test key features:**
   - Homepage loads correctly
   - Can register a new account
   - Can login
   - Can create a post
   - Can view stories
   - Can access job board

## Step 6: Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` in Render to your custom domain

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `client/package.json`
- Verify TypeScript compiles locally: `cd client && npm run build`

### API Calls Fail (CORS Errors)
- Verify `VITE_API_URL` is set correctly in Vercel
- Verify `CLIENT_URL` is set correctly in Render
- Check browser console for exact error

### 404 on Routes
- Vercel should handle this automatically with the `vercel.json` rewrites
- If issues persist, check `vercel.json` configuration

## Next Steps

After successful deployment:
- [ ] Test all features thoroughly
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure custom domain
- [ ] Set up automated backups
- [ ] Create admin account
- [ ] Share with users! 🎉

