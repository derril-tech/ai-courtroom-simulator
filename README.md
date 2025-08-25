# Courtroom Simulator

AI-powered mock trial engine for legal education and training.

## Overview

Courtroom Simulator is a multi-agent mock trial engine that orchestrates realistic legal proceedings from case intake through verdict. Built with Next.js 14, NestJS, FastAPI, and CrewAI, it provides a comprehensive platform for legal education and training.

## Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **API Gateway**: NestJS with OpenAPI 3.1, RBAC, WebSocket support
- **Orchestrator**: FastAPI with CrewAI for multi-agent coordination
- **Workers**: Python Celery workers for background processing
- **Infrastructure**: PostgreSQL, Redis, NATS, MinIO (S3-compatible)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd courtroom-simulator
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   npm run docker:up
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

### Services

- **Frontend**: http://localhost:3000
- **Gateway**: http://localhost:3001
- **Orchestrator**: http://localhost:8000
- **MinIO Console**: http://localhost:9001
- **NATS HTTP**: http://localhost:8222

## Project Structure

```
courtroom-simulator/
├── apps/
│   ├── frontend/          # Next.js 14 frontend
│   ├── gateway/           # NestJS API gateway
│   ├── orchestrator/      # FastAPI + CrewAI orchestrator
│   └── workers/           # Python Celery workers
├── packages/
│   └── sdk/              # Shared TypeScript SDK
├── docker-compose.dev.yml # Development infrastructure
├── env.example           # Environment variables template
└── README.md
```

## Development

### Frontend (Next.js 14)

```bash
cd apps/frontend
npm run dev
```

### Gateway (NestJS)

```bash
cd apps/gateway
npm run start:dev
```

### Orchestrator (FastAPI)

```bash
cd apps/orchestrator
python -m uvicorn main:app --reload
```

### Workers (Celery)

```bash
cd apps/workers
celery -A celery_app worker --loglevel=info
```

## Docker Development

Start all services with Docker:

```bash
# Start infrastructure only
docker-compose -f docker-compose.dev.yml --profile backend up -d

# Start with frontend
docker-compose -f docker-compose.dev.yml --profile frontend up -d
```

## Testing

```bash
# Run all tests
npm run test

# Run specific service tests
npm run test:frontend
npm run test:gateway
npm run test:sdk
```

## Linting

```bash
# Run all linters
npm run lint

# Run specific service linters
npm run lint:frontend
npm run lint:gateway
npm run lint:sdk
```

## Building

```bash
# Build all services
npm run build

# Build specific services
npm run build:frontend
npm run build:gateway
npm run build:sdk
```

## Environment Variables

Copy `env.example` to `.env` and configure:

- **Database**: PostgreSQL connection string
- **Redis**: Redis connection string
- **NATS**: NATS connection string
- **AWS/S3**: Object storage configuration
- **OpenAI**: API key for AI features
- **JWT**: Authentication configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue on GitHub.
