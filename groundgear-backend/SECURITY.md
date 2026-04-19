# GroundGear Backend Security Guidelines

## Environment Variables

### Development Setup
1. Copy `.env.example` to `.env.local`
2. Fill in development database credentials
3. Generate a JWT secret:
   ```bash
   openssl rand -base64 32
   ```

### Production Deployment
1. **NEVER** use the same credentials as development
2. Generate a strong JWT secret (minimum 32 characters)
3. Set `SPRING_PROFILES_ACTIVE=prod`
4. Update `CORS_ALLOWED_ORIGINS` with your domain
5. Use strong passwords (minimum 16 characters):
   - Include uppercase and lowercase letters
   - Include numbers and special characters
   - Avoid dictionary words

### Using GitHub Secrets (Recommended)
Instead of committing `.env.production`, use GitHub Secrets:
```
Settings > Secrets and variables > Actions
```

Add these secrets:
- `DB_HOST`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGINS`

## Security Features Enabled

### 1. Session Security
- ✅ HttpOnly cookies (prevents XSS attacks)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Strict (prevents CSRF)
- ✅ 30-minute timeout

### 2. Error Handling
- ✅ No stack traces exposed to clients
- ✅ No sensitive information in error messages
- ✅ Detailed logs server-side only

### 3. Logging & Monitoring
- ✅ Audit trails for login attempts
- ✅ Failed login attempt tracking
- ✅ Account lockout after 5 failed attempts
- ✅ 15-minute lockout duration

### 4. Database
- ✅ Passwords hashed with bcrypt
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Connection pooling with limits

### 5. API Security
- ✅ JWT token validation on all protected endpoints
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on auth endpoints
- ✅ CORS configured for allowed origins only

### 6. Password Policy
- ✅ Minimum 8 characters
- ✅ Must contain uppercase and lowercase
- ✅ Must contain numbers
- ✅ Must contain special characters (!@#$%^&*)

## API Endpoints Security

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (Require JWT)
All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Endpoints
- `GET /api/admin/users` - Admin only
- `DELETE /api/admin/users/{id}` - Admin only
- `PUT /api/admin/users/{id}/role` - Admin only

## Common Security Tasks

### Generate Strong Passwords
```bash
openssl rand -base64 32
```

### Rotate JWT Secret
1. Generate new secret
2. Deploy with new secret
3. Old tokens will be invalid (logout all users)

### Check Logs for Suspicious Activity
```bash
grep "FAILED_LOGIN" logs/application.log
grep "ACCOUNT_LOCKED" logs/application.log
```

## Incident Response

### If a Credential is Exposed
1. **Immediately** rotate the exposed credential
2. Review logs for unauthorized access
3. Force password reset for all users
4. Update GitHub Secrets
5. Redeploy application

### If JWT Secret is Compromised
1. Generate new JWT secret
2. Deploy immediately
3. All existing tokens become invalid (users must re-login)

## Regular Security Checks

- [ ] Review failed login attempts weekly
- [ ] Check for security updates monthly
- [ ] Rotate admin password quarterly
- [ ] Audit database access logs monthly
- [ ] Update dependencies monthly

## Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Guide](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)