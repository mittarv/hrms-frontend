# Security Guidelines for HRMS Frontend

## Environment Variables Security

This is an **open source repository**. All sensitive environment variables must be stored securely and never committed to the repository.

### GitHub Secrets vs Variables

**Use GitHub SECRETS for sensitive data:**
- `VITE_REACT_APP_GOOGLE_SECRET` - OAuth secret (SENSITIVE)
- `VITE_ENCRYPTION_KEY` - Encryption keys (SENSITIVE)

**Use GitHub VARIABLES for non-sensitive public data:**
- `VITE_REACT_APP_GOOGLE_CLIENT_ID` - OAuth client ID (public)
- `VITE_REACT_APP_HOSTED_URL` - API URL (public)
- `VITE_ALLOWED_EMAIL_DOMAIN` - Email domain (public)
- `HOST_PORT` - Port configuration (public)

### Security Measures Implemented

1. **`.env` file is in `.gitignore`** - Never committed to repository
2. **`.env` file is removed from Docker image** - Cleaned up after build in Dockerfile
3. **`.env` file is cleaned up after deployment** - Removed from workspace after use
4. **Secrets are masked in GitHub Actions logs** - Automatically masked by GitHub
5. **Secrets are passed via environment variables** - Not exposed in command line

### How to Add New Environment Variables

1. **If sensitive (API keys, secrets, tokens):**
   - Add to GitHub **Secrets** (Settings > Secrets and variables > Actions > Secrets)
   - Update workflow to use `${{ secrets.VARIABLE_NAME }}`

2. **If public (URLs, IDs, configuration):**
   - Add to GitHub **Variables** (Settings > Secrets and variables > Actions > Variables)
   - Update workflow to use `${{ vars.VARIABLE_NAME }}`

### Never Do This

❌ **DO NOT** commit `.env` files to git
❌ **DO NOT** hardcode secrets in code
❌ **DO NOT** use variables for sensitive data
❌ **DO NOT** log secrets in console.log or print statements
❌ **DO NOT** expose secrets in error messages

### Best Practices

✅ Always use GitHub Secrets for sensitive data
✅ Clean up `.env` files after use
✅ Remove `.env` from Docker images after build
✅ Use environment-specific configurations
✅ Review workflow files before committing
✅ Rotate secrets regularly
