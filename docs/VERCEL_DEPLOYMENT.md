# Deploying Mango Social to Vercel

This guide will walk you through deploying Mango Social to Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **PostgreSQL Database** - You'll need a production database (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/database`)
4. Run migrations on your production database:

```bash
# Set your production database URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
cd server
npm run db:migrate
npm run db:migrate:images
npm run db:migrate:jobs
npm run db:migrate:messaging
npm run db:migrate:features
npm run db:migrate:username
npm run db:migrate:banner

# Optional: Seed with initial data
npm run db:seed
```

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings > Database and copy the connection string
3. Run the same migrations as above

## Step 2: Configure Environment Variables

You'll need to set these environment variables in Vercel:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=5000

# CORS
CLIENT_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional Variables

```env
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@mangosocial.com

# OAuth (if implementing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 3: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# From your project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? mango-social
# - In which directory is your code located? ./
# - Want to override the settings? No
```

4. **Set Environment Variables:**
```bash
# Set each environment variable
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CLIENT_URL
# ... add all other variables
```

5. **Deploy to Production:**
```bash
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. **Import Project:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the repository

2. **Configure Project:**
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm run install:all`

3. **Add Environment Variables:**
   - Go to Settings > Environment Variables
   - Add all the required variables listed above
   - Make sure to add them for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

## Step 4: Update Client Environment Variables

After deployment, you need to update the client to point to your production API:

1. In Vercel Dashboard, go to Settings > Environment Variables
2. Add:
```env
VITE_API_URL=https://your-app.vercel.app
```

3. Redeploy the application

## Step 5: Verify Deployment

1. **Check the Frontend:**
   - Visit your Vercel URL (e.g., `https://mango-social.vercel.app`)
   - Verify the homepage loads

2. **Check the API:**
   - Visit `https://your-app.vercel.app/api/health` (if you have a health endpoint)
   - Or try to register/login

3. **Test Core Features:**
   - Register a new account
   - Login
   - Create a post
   - Upload an image
   - Test app preferences

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Make sure all dependencies are in `package.json`
- Check that `npm run install:all` installs both client and server dependencies

**Error: "Build exceeded maximum duration"**
- Vercel free tier has a 45-second build limit
- Optimize your build process
- Consider upgrading to Pro plan

### Database Connection Issues

**Error: "Connection timeout"**
- Check your DATABASE_URL is correct
- Ensure your database allows connections from Vercel's IP ranges
- For Neon/Supabase, make sure SSL is enabled

### API Routes Not Working

**Error: "404 on /api routes"**
- Check `vercel.json` routing configuration
- Ensure server code is being built correctly
- Check Vercel function logs

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Post-Deployment

### Custom Domain

1. Go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` environment variable

### Monitoring

1. **Vercel Analytics:**
   - Enable in Settings > Analytics
   - Monitor performance and usage

2. **Error Tracking:**
   - Consider adding Sentry for error tracking
   - Add `SENTRY_DSN` to environment variables

3. **Database Monitoring:**
   - Monitor database performance in Neon/Supabase dashboard
   - Set up alerts for high usage

### Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

To disable auto-deployment:
- Go to Settings > Git
- Configure deployment branches

## Performance Optimization

1. **Enable Caching:**
   - Static assets are automatically cached
   - Consider adding Redis for API caching

2. **Image Optimization:**
   - Use Vercel's Image Optimization
   - Or migrate to Cloudinary/S3 for images

3. **Database Connection Pooling:**
   - Use connection pooling for PostgreSQL
   - Consider using PgBouncer

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT_SECRET is strong and unique
- [ ] DATABASE_URL uses SSL
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Security headers are set (check vercel.json)
- [ ] No sensitive data in client code
- [ ] Database backups are configured

## Cost Considerations

### Vercel Free Tier Includes:
- 100 GB bandwidth
- Unlimited deployments
- Automatic HTTPS
- Serverless functions (100 GB-hours)

### Potential Costs:
- **Database**: Neon free tier (0.5 GB), Supabase free tier (500 MB)
- **Bandwidth**: If you exceed 100 GB/month
- **Function Execution**: If you exceed free tier limits

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check function logs in Vercel dashboard
3. Review this guide's troubleshooting section
4. Open an issue on GitHub
5. Contact Vercel support

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domain
3. Enable analytics
4. Set up automated backups
5. Create admin account
6. Test all features thoroughly
7. Share with users! 🎉

