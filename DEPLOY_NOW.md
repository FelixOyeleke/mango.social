# 🚀 Deploy Mango Social to Vercel NOW!

Follow these simple steps to deploy your application to Vercel.

## Method 1: Using Vercel Dashboard (Easiest - Recommended)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with your GitHub account (recommended)

### Step 2: Import Your Project
1. Once logged in, click "Add New..." → "Project"
2. You'll see your GitHub repositories
3. Find "mango.social" and click "Import"

### Step 3: Configure Project
Vercel will auto-detect the settings, but verify:
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm run install:all`

Click "Deploy" (we'll add environment variables next)

### Step 4: Set Up Production Database

#### Option A: Using Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Click "Create Project"
4. Name it "mango-social"
5. Select region closest to you
6. Click "Create Project"
7. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

#### Option B: Using Supabase (Alternative - Free)
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click "New Project"
4. Fill in details and create
5. Go to Settings → Database
6. Copy the connection string

### Step 5: Run Database Migrations

You need to run migrations on your production database. Here's how:

**Option 1: Using Local Terminal (if you can enable PowerShell scripts)**
```powershell
# Enable scripts (run PowerShell as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run migrations
$env:DATABASE_URL="your-neon-connection-string-here"
cd server
npm run db:migrate
npm run db:migrate:images
npm run db:migrate:jobs
npm run db:migrate:messaging
npm run db:migrate:features
npm run db:migrate:username
npm run db:migrate:banner
npm run db:seed
```

**Option 2: Using Neon SQL Editor**
1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Copy the contents of each migration file from `server/src/db/migrations/`
4. Run them one by one in order

### Step 6: Add Environment Variables in Vercel

1. In your Vercel project, go to "Settings" → "Environment Variables"
2. Add the following variables (click "Add" for each):

**Required Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon/Supabase connection string | Production, Preview, Development |
| `JWT_SECRET` | Generate a strong secret (min 32 chars) | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `7d` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `PORT` | `5000` | Production, Preview, Development |
| `CLIENT_URL` | Your Vercel URL (e.g., `https://mango-social.vercel.app`) | Production |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Production, Preview, Development |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Production, Preview, Development |

**For Client (Frontend):**

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | Your Vercel URL (same as CLIENT_URL) | Production, Preview, Development |

**To generate a strong JWT_SECRET:**
- Go to [randomkeygen.com](https://randomkeygen.com)
- Copy a "CodeIgniter Encryption Key" (256-bit)
- Or use: `openssl rand -base64 32` in terminal

### Step 7: Redeploy

After adding environment variables:
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Step 8: Test Your Deployment

1. Click "Visit" to open your deployed app
2. Try to register a new account
3. Login
4. Create a post
5. Test other features

## Method 2: Using Vercel CLI (Advanced)

If you can enable PowerShell scripts:

```powershell
# Enable scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts, then add environment variables:
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add all other variables

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify build command is correct

### API Not Working
- Check function logs in Vercel
- Verify environment variables are set correctly
- Make sure DATABASE_URL is correct

### Database Connection Fails
- Verify DATABASE_URL format
- Check database is running
- Ensure SSL is enabled in connection string

### Can't Run PowerShell Scripts
- Use Method 1 (Vercel Dashboard)
- Or run PowerShell as Administrator and enable scripts

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Create an admin account
3. ✅ Set up monitoring (Vercel Analytics)
4. ✅ Configure custom domain (optional)
5. ✅ Set up error tracking (Sentry - optional)
6. ✅ Share with users! 🎉

## Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Supabase Dashboard**: https://app.supabase.com
- **Your GitHub Repo**: https://github.com/FelixOyeleke/mango.social

## Need Help?

- Check [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for detailed guide
- Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for checklist
- Open an issue on GitHub
- Contact Vercel support

---

**Ready to deploy? Let's go! 🚀**

