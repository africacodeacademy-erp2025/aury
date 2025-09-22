# Docker Setup for Aury Project

This document provides comprehensive instructions for running the Aury Next.js application using Docker in both development and production environments.

## 🚀 Quick Start

### Development Mode
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### Production Mode
```bash
# Start production environment
docker-compose -f docker-compose.prod.yaml up --build

# Or run in detached mode
docker-compose -f docker-compose.prod.yaml up -d --build
```

## 📁 Project Structure

```
├── Dockerfile.dev              # Development Dockerfile
├── Dockerfile.prod             # Production Dockerfile  
├── docker-compose.dev.yml     # Development compose configuration
├── docker-compose.prod.yaml    # Production compose configuration
├── .env.development            # Development environment variables
├── .env.production             # Production environment variables
├── .dockerignore               # Files to exclude from Docker builds
└── next.config.ts              # Next.js config with standalone output
```

## 🔧 Configuration Files

### Dockerfiles

- **Dockerfile.dev**: Development environment with hot reload, volume mounts, and Turbopack support
- **Dockerfile.prod**: Multi-stage production build with security optimizations

### Docker Compose

- **docker-compose.dev.yml**: Development setup with volume mounts for instant code changes
- **docker-compose.prod.yaml**: Production setup with health checks and optimized configuration

### Environment Variables

The setup supports the following environment variables:

#### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### Firebase Admin
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`

#### Stripe Configuration
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### General Settings
- `NODE_ENV`
- `NEXT_TELEMETRY_DISABLED`
- `USE_FIREBASE_EMULATOR`
- `NEXT_PUBLIC_APP_ENV`

## 🛠️ Development Environment

### Features
- ✅ Hot reload with volume mounts
- ✅ Turbopack for faster development builds
- ✅ Automatic package manager detection (npm/yarn/pnpm)
- ✅ Firebase emulator support
- ✅ Real-time code synchronization

### Volume Mounts
The development setup mounts the following directories for hot reload:
- `./app` → `/app/app`
- `./components` → `/app/components`
- `./lib` → `/app/lib`
- `./types` → `/app/types`
- `./firebase` → `/app/firebase`
- `./public` → `/app/public`
- Configuration files for instant updates

### Usage
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 🚀 Production Environment

### Features
- ✅ Multi-stage build for optimized image size
- ✅ Standalone Next.js output
- ✅ Non-root user for security
- ✅ Health check endpoint
- ✅ Turbopack for faster builds
- ✅ Production optimizations

### Security Features
- Runs as non-root user (`nextjs:nodejs`)
- Minimal runtime dependencies
- Optimized image layers
- Environment variable validation

### Usage
```bash
# Start production environment
docker-compose -f docker-compose.prod.yaml up --build

# Health check
curl http://localhost:3000/api/health

# View logs
docker-compose -f docker-compose.prod.yaml logs -f

# Stop environment
docker-compose -f docker-compose.prod.yaml down
```

## 🔍 Package Manager Detection

The Docker setup automatically detects and uses the appropriate package manager:

1. **pnpm** (if `pnpm-lock.yaml` exists)
2. **yarn** (if `yarn.lock` exists)  
3. **npm** (if `package-lock.json` exists)
4. **npm** (fallback if no lockfile found)

## 📊 Monitoring & Health Checks

### Health Check Endpoint
The production setup includes a health check at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-09-18T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Docker Health Check
The production container includes a built-in health check:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Find and kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Volume mount permissions (Linux/Mac)**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER ./
   ```

3. **Environment variables not loading**
   - Ensure `.env.development` or `.env.production` files exist
   - Check for syntax errors in environment files
   - Verify all required variables are set

4. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose -f docker-compose.dev.yml build --no-cache
   ```

### Debugging Commands

```bash
# Access container shell
docker exec -it aury-dev /bin/sh

# View container logs
docker logs aury-dev

# Inspect container
docker inspect aury-dev

# Check container resources
docker stats aury-dev
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -f Dockerfile.prod -t aury:latest .
```

### Production Deployment
```bash
# Tag for production
docker tag aury:latest your-registry/aury:v1.0.0

# Push to registry
docker push your-registry/aury:v1.0.0

# Deploy to production
docker-compose -f docker-compose.prod.yaml pull
docker-compose -f docker-compose.prod.yaml up -d
```

## 📈 Performance Optimizations

### Build Optimizations
- Multi-stage builds reduce final image size
- Standalone output eliminates unnecessary dependencies
- Turbopack for faster development and production builds
- Optimized layer caching

### Runtime Optimizations
- Alpine Linux base image for smaller footprint
- Non-root user for security
- Health checks for container orchestration
- Proper signal handling for graceful shutdowns

## 🔐 Security Best Practices

1. **Non-root execution**: Container runs as `nextjs` user
2. **Minimal attack surface**: Only necessary files in production image
3. **Environment isolation**: Separate development and production configs
4. **Secret management**: Environment variables for sensitive data
5. **Regular updates**: Keep base images and dependencies updated

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

---

For issues or questions, please refer to the project documentation or create an issue in the repository.