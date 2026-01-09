# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### Code Preparation
- [ ] All code is committed and pushed to GitHub
- [ ] No sensitive data in code (passwords, API keys, etc.)
- [ ] `.env` files are in `.gitignore`
- [ ] Build runs successfully locally (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] No console errors in development

### Database Setup
- [ ] Production database created (Neon/Supabase/other)
- [ ] Database connection string obtained
- [ ] Database migrations run on production database
- [ ] Test data seeded (optional)
- [ ] Database backups configured
- [ ] SSL enabled for database connections

### Environment Variables Prepared
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `JWT_SECRET` - Strong, unique secret (min 32 characters)
- [ ] `JWT_EXPIRES_IN` - Token expiration time (e.g., "7d")
- [ ] `CLIENT_URL` - Your Vercel app URL (update after first deploy)
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Set to 5000
- [ ] `RATE_LIMIT_WINDOW_MS` - Rate limit window (e.g., 900000)
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (e.g., 100)

### Optional Environment Variables
- [ ] Email configuration (SMTP_HOST, SMTP_PORT, etc.)
- [ ] OAuth credentials (if using social login)
- [ ] Analytics IDs
- [ ] Error tracking (Sentry DSN)

## Deployment Steps

### Initial Deployment
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel CLI (`vercel login`)
- [ ] Project deployed (`vercel` or via dashboard)
- [ ] Deployment URL obtained

### Configuration
- [ ] All environment variables added in Vercel dashboard
- [ ] Environment variables set for Production, Preview, and Development
- [ ] `CLIENT_URL` updated with actual Vercel URL
- [ ] `VITE_API_URL` set in client environment variables
- [ ] Project redeployed after adding environment variables

### Domain Setup (Optional)
- [ ] Custom domain added in Vercel
- [ ] DNS configured
- [ ] SSL certificate verified
- [ ] `CLIENT_URL` updated with custom domain

## Post-Deployment

### Verification
- [ ] Homepage loads successfully
- [ ] API health check works (`/api/health`)
- [ ] User registration works
- [ ] User login works
- [ ] Creating posts works
- [ ] Image uploads work
- [ ] Job board works (if enabled)
- [ ] Messaging works
- [ ] App preferences work
- [ ] Admin dashboard accessible

### Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile devices
- [ ] Test all critical user flows
- [ ] Check for console errors
- [ ] Verify API responses

### Performance
- [ ] Check Lighthouse score
- [ ] Verify page load times
- [ ] Check API response times
- [ ] Monitor function execution times
- [ ] Review Vercel Analytics

### Security
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured (check vercel.json)
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] No sensitive data exposed in client
- [ ] Database uses SSL
- [ ] Strong JWT secret in use

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry/other)
- [ ] Database monitoring set up
- [ ] Alerts configured for errors
- [ ] Uptime monitoring (optional)

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor deployment logs
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Monitor database usage
- [ ] Check bandwidth usage
- [ ] Review function execution times

### Updates
- [ ] Keep dependencies updated
- [ ] Run security audits (`npm audit`)
- [ ] Test updates in preview before production
- [ ] Monitor Vercel status page

### Backups
- [ ] Database backups configured
- [ ] Backup restoration tested
- [ ] Environment variables documented
- [ ] Deployment configuration backed up

## Troubleshooting

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in package.json
3. Ensure build command is correct
4. Check for TypeScript errors
5. Verify file paths are correct

### If API doesn't work:
1. Check function logs in Vercel
2. Verify environment variables are set
3. Check database connection
4. Verify API routes in vercel.json
5. Check CORS configuration

### If database connection fails:
1. Verify DATABASE_URL is correct
2. Check database allows Vercel connections
3. Ensure SSL is enabled
4. Check database is running
5. Verify credentials are correct

## Rollback Plan

If something goes wrong:
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find last working deployment
4. Click "..." menu
5. Select "Promote to Production"

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Project GitHub Issues](https://github.com/FelixOyeleke/mango.social/issues)
- [Deployment Guide](docs/VERCEL_DEPLOYMENT.md)

## Notes

- Vercel free tier: 100 GB bandwidth, unlimited deployments
- Function timeout: 10 seconds (free tier), 60 seconds (pro)
- Build time limit: 45 seconds (free tier)
- Consider upgrading to Pro if you hit limits

---

**Last Updated:** 2026-01-09
**Deployment Status:** ⬜ Not Deployed | ⬜ Preview | ⬜ Production

