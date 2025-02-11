#!/bin/bash

# Database Configuration
git add src/config/database.ts
git commit -m "refactor(db): Update database configuration
- Remove SSL configuration
- Add connection pool settings
- Implement connection management
- Add graceful shutdown handler"

# Docker Configuration
git add Dockerfile
git commit -m "chore(docker): Update Dockerfile configuration
- Optimize build process
- Add production settings
- Configure environment variables"

git add docker-compose.yml
git commit -m "chore(docker): Update docker-compose configuration
- Switch to DATABASE_URL format
- Update service configurations
- Configure environment variables
- Add volume mappings"

# Environment Files
git add .env.*
git commit -m "chore(env): Update environment configurations
- Add DATABASE_URL settings
- Update service URLs
- Configure environment-specific variables"

# Request Limiters
git add src/middlewares/requestLimiter.ts
git commit -m "feat(security): Add request size limiting
- Add body size limits
- Configure message size limits
- Implement request validation"

# Main Application
git add src/index.ts
git commit -m "feat(app): Update main application setup
- Add request limiter middleware
- Configure express settings
- Update error handling"

# Message Routes
git add src/routes/message.routes.ts
git commit -m "feat(routes): Update message routes
- Add request validation
- Implement rate limiting
- Update route handlers"

# Validation
git add src/validations/common/index.ts
git commit -m "feat(validation): Add common validation utilities
- Add request parameter validation
- Implement sanitization
- Add security checks"

# Types
git add src/types/userService.ts
git commit -m "feat(types): Add user service types
- Add DTO interfaces
- Add service response types
- Add error types"

echo "All changes have been committed successfully!" 