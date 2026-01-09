# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@mangosocial.com** (or your preferred contact method)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

## Security Best Practices

### For Developers

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique values for `JWT_SECRET`
   - Rotate secrets regularly

2. **Authentication**
   - Passwords are hashed using bcrypt with salt rounds of 10
   - JWT tokens expire after 7 days by default
   - Implement refresh token rotation

3. **Input Validation**
   - All user inputs are validated and sanitized
   - Use parameterized queries to prevent SQL injection
   - Implement rate limiting on all endpoints

4. **File Uploads**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Store files securely (database or S3)

5. **CORS**
   - Configure CORS to only allow trusted origins
   - Don't use wildcard (*) in production

6. **Dependencies**
   - Regularly update dependencies
   - Run `npm audit` to check for vulnerabilities
   - Use tools like Snyk or Dependabot

### For Deployment

1. **HTTPS**
   - Always use HTTPS in production
   - Implement HSTS headers

2. **Database**
   - Use strong database passwords
   - Restrict database access to application servers only
   - Enable SSL for database connections
   - Regular backups

3. **Server**
   - Keep server software up to date
   - Use a firewall
   - Implement DDoS protection
   - Monitor logs for suspicious activity

4. **Environment**
   - Set `NODE_ENV=production`
   - Disable debug mode
   - Remove development dependencies

## Security Headers

The application implements the following security headers:

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})
```

## Known Security Considerations

1. **Image Storage**: Currently using database storage for images. For production, consider using S3 or Cloudinary.
2. **Rate Limiting**: Implemented but may need adjustment based on traffic patterns.
3. **Session Management**: JWT tokens are stateless. Consider implementing token blacklisting for logout.

## Security Checklist for Production

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Implement logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and update dependencies
- [ ] Implement CSP headers
- [ ] Set up firewall rules
- [ ] Enable database SSL
- [ ] Implement 2FA for admin accounts
- [ ] Set up automated security scanning
- [ ] Review file upload security
- [ ] Implement API versioning
- [ ] Set up DDoS protection

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.

