# Docker Compose Usage Guide

This project uses a base Docker Compose configuration with production as the default and development overrides.

## File Structure

- `docker-compose.yml` - Base configuration with **production** settings (default)
- `docker-compose.dev.override.yml` - Development overrides

## Usage

### Production (Default)

By default, Docker Compose will use the production configuration:

```bash
docker-compose up
```

or

```bash
docker-compose up -d
```

### Development

For development, explicitly specify the development override file:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.override.yml up
```

or

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.override.yml up -d
```

### Build Commands

Production (default):

```bash
docker-compose build
```

Development:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.override.yml build
```

## Dockge Integration

Dockge will automatically pick up `docker-compose.yml` and run the **production** configuration by default. For development deployments, you'll need to specify the development override file in your deployment configuration.

## Benefits

- **Production First**: Production is the default, reducing deployment errors
- **Shared Base**: Common configurations are centralized in the base file
- **Environment Isolation**: Development and production have separate overrides
- **DRY Principle**: No duplication of common configurations
- **Safety**: Production settings are used unless explicitly overridden

## Environment Variables

Make sure you have the appropriate environment files:

- `.env` or `.env.production` for production
- `.env.development` for development
