# Microservices Blog Platform - Project Constitution

## Project Vision
Build a scalable, resilient microservices-based blog platform that demonstrates enterprise-grade architecture patterns, service independence, and event-driven communication.

## Core Principles

### 1. Microservices Architecture
- **Service Independence**: Each service can be developed, deployed, and scaled independently
- **Single Responsibility**: Each service focuses on one business capability
- **Decentralized Data**: Each service owns its data and database
- **Smart Endpoints, Dumb Pipes**: Business logic in services, simple messaging infrastructure
- **Design for Failure**: Services must handle partial failures gracefully

### 2. Communication Patterns
- **Synchronous**: REST APIs via API Gateway for client-facing operations
- **Asynchronous**: Event-driven for service-to-service communication
- **Service Discovery**: Environment-based configuration (Docker Compose DNS)
- **Circuit Breaker**: Prevent cascading failures
- **Retry Strategy**: Exponential backoff with jitter

### 3. Data Management
- **Database per Service**: No shared databases between services
- **Eventual Consistency**: Accept eventual consistency for cross-service data
- **Event Sourcing**: Consider for audit trails and replay capability
- **Data Synchronization**: Use events to maintain local caches

### 4. Operational Excellence
- **Observability**: Centralized logging, distributed tracing, metrics
- **Health Checks**: All services expose health endpoints
- **Graceful Degradation**: System remains partially functional when services fail
- **Infrastructure as Code**: All infrastructure defined in version control
- **Automated Testing**: Unit, integration, and E2E tests

## Technical Architecture

### System Components

```
┌──────────────────────────────────────────────────┐
│                   Clients                         │
│            (Web, Mobile, API)                     │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│              API Gateway (:3000)                  │
│  - Request Routing                                │
│  - Authentication Verification                    │
│  - Rate Limiting                                  │
│  - Request/Response Logging                       │
└──────┬───────────────────────┬────────────────────┘
       │                       │
┌──────▼────────┐      ┌──────▼──────────┐
│ Auth Service  │      │  Posts Service   │
│   (:3001)     │      │    (:3002)       │
│               │      │                  │
│ - User Auth   │      │ - Post CRUD      │
│ - JWT Tokens  │      │ - Categories     │
│ - User Mgmt   │      │ - Author Cache   │
└──────┬────────┘      └──────┬───────────┘
       │                      │
       │   ┌──────────────────┘
       │   │
┌──────▼───▼─────────────────────────────┐
│        Message Bus (RabbitMQ)          │
│  - user.created, user.updated           │
│  - post.created, post.published         │
└────────────────────────────────────────┘
       │              │
┌──────▼──────┐  ┌───▼────────┐
│  auth_db    │  │  posts_db  │
│ (PostgreSQL)│  │(PostgreSQL)│
└─────────────┘  └────────────┘

┌────────────────────────────────────────┐
│         Redis (Shared Cache)            │
│  - JWT Blacklist                        │
│  - Rate Limiting Counters              │
│  - Session Storage                      │
└────────────────────────────────────────┘
```

## Technical Constraints

### Technology Stack
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js 4.x for all services
- **Message Broker**: RabbitMQ 3.x
- **Databases**: PostgreSQL 15+ (one per service)
- **Cache**: Redis 7+
- **Containerization**: Docker + Docker Compose
- **API Documentation**: OpenAPI 3.0 (per service)
- **Testing**: Jest + Supertest
- **Logging**: Winston (JSON format)
- **Tracing**: Jaeger (optional, production-ready)

### Service Structure Template
```
service-name/
├── src/
│   ├── config/           # Service configuration
│   ├── models/           # Data models
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── events/           # Event handlers
│   │   ├── publishers/   # Event publishing
│   │   └── subscribers/  # Event consuming
│   ├── middleware/       # Service-specific middleware
│   ├── utils/            # Utilities
│   ├── app.js            # Express app
│   └── server.js         # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── migrations/           # Database migrations
├── Dockerfile
├── package.json
└── README.md
```

### Shared Libraries (packages/common)
```
common/
├── src/
│   ├── events/          # Event schemas and base classes
│   ├── errors/          # Error classes
│   ├── middleware/      # Shared middleware
│   ├── utils/           # Shared utilities
│   └── types/           # TypeScript types (if using TS)
└── package.json
```

## Service Specifications

### API Gateway
**Responsibility**: Entry point for all client requests
**Port**: 3000
**Database**: None (stateless)

**Key Features**:
- Route requests to appropriate services
- JWT token validation (using Redis cache)
- Rate limiting per IP/user
- CORS handling
- Request/response logging
- Circuit breaker for downstream services

### Auth Service
**Responsibility**: User authentication and authorization
**Port**: 3001
**Database**: `auth_db` (PostgreSQL)

**Key Features**:
- User registration and login
- JWT token generation and refresh
- Password hashing (bcrypt)
- User profile management
- Token revocation (blacklist in Redis)

**Events Published**:
- `user.created`: When new user registers
- `user.updated`: When user profile updates
- `user.deleted`: When user account deleted

### Posts Service
**Responsibility**: Blog post management
**Port**: 3002
**Database**: `posts_db` (PostgreSQL)

**Key Features**:
- Post CRUD operations
- Category management
- Author information cache (from Auth Service)
- Post search and filtering
- Pagination

**Events Subscribed**:
- `user.created`: Cache author info
- `user.updated`: Update cached author info
- `user.deleted`: Handle orphaned posts

**Events Published**:
- `post.created`: When new post created
- `post.published`: When draft becomes published
- `post.deleted`: When post deleted

## Communication Contracts

### REST API Standards
- **Base URL**: Service-specific (e.g., `/auth`, `/posts`)
- **Versioning**: Via API Gateway (`/api/v1`)
- **Content-Type**: `application/json`
- **Authentication**: Bearer token in Authorization header
- **Status Codes**: Standard HTTP codes (200, 201, 400, 401, 404, 500)

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2024-01-15T10:00:00Z" }
}
```

### Event Schema Standard
```json
{
  "eventId": "uuid-v4",
  "eventType": "user.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0",
  "data": { ... }
}
```

## Non-Functional Requirements

### Performance
- **Response Time**:
  - API Gateway overhead: < 50ms
  - Service response: < 200ms (95th percentile)
- **Throughput**: 1000 requests/second (aggregate)
- **Message Processing**: < 100ms per event

### Scalability
- **Horizontal Scaling**: All services stateless (except databases)
- **Database Connection Pooling**: Max 20 connections per service
- **Message Queue**: Durable queues, persistent messages
- **Load Balancing**: Round-robin (handled by orchestrator)

### Availability
- **Target Uptime**: 99.9% (8.76 hours downtime/year)
- **Graceful Degradation**: System partially functional if one service down
- **Health Checks**: Every 10 seconds
- **Auto-restart**: Failed containers restart automatically

### Security
- **Authentication**: JWT with 1-hour expiry
- **Refresh Tokens**: 7-day expiry, stored hashed
- **Rate Limiting**:
  - Auth endpoints: 5/minute per IP
  - API endpoints: 100/minute per user
- **HTTPS Only**: In production (TLS termination at load balancer)
- **Secret Management**: Environment variables, never hardcoded
- **Input Validation**: All inputs validated and sanitized

### Resilience
- **Circuit Breaker**:
  - Threshold: 50% failure rate over 10 requests
  - Timeout: 30 seconds
  - Half-open test: 1 request after timeout
- **Retry Strategy**:
  - Max retries: 3
  - Backoff: Exponential with jitter
  - Timeout: 5 seconds per attempt
- **Dead Letter Queue**: Failed events moved to DLQ after 3 retries

## Observability

### Logging
- **Format**: JSON (structured logging)
- **Levels**: ERROR, WARN, INFO, DEBUG
- **Fields**: timestamp, service, level, message, trace_id, user_id, request_id
- **Storage**: Console (development), File (production)

### Metrics
- **Service Health**: CPU, memory, uptime
- **API Metrics**: Request count, response time, error rate
- **Business Metrics**: Users registered, posts created
- **Tools**: Prometheus (optional)

### Tracing
- **Distributed Tracing**: Jaeger (optional, production-ready)
- **Trace ID**: Propagated through all services
- **Span Tags**: Service name, operation, HTTP method, status code

### Health Checks
All services expose:
- `GET /health`: Simple health check
- `GET /ready`: Readiness check (dependencies available)

## Development Practices

### Code Quality
- **Linting**: ESLint with Airbnb style guide
- **Formatting**: Prettier
- **Commit Convention**: Conventional Commits
- **Code Review**: Required before merge

### Testing Strategy
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: Test service APIs with real database
- **Contract Tests**: Ensure event schemas match
- **E2E Tests**: Critical user flows across services
- **Performance Tests**: Load testing with k6 or Artillery

### Git Workflow
- **Branching**: Feature branches from `main`
- **Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes
- **PR Template**: Description, testing steps, checklist
- **CI/CD**: Automated tests on PR, deploy on merge to main

## Environment Configuration

### Development (docker-compose.yml)
- All services on same network
- Local PostgreSQL instances
- RabbitMQ with management UI
- Redis for caching
- Hot reload enabled

### Production Considerations
- Kubernetes deployment
- Managed PostgreSQL (RDS, Cloud SQL)
- Managed Redis (ElastiCache, MemoryStore)
- Managed RabbitMQ (CloudAMQP) or Kafka
- Secrets from vault (HashiCorp Vault, AWS Secrets Manager)
- TLS everywhere
- Auto-scaling based on CPU/memory

## Out of Scope (Phase 1)

- Frontend application
- File upload/storage service
- Email notification service
- Real-time features (WebSocket)
- Full-text search (Elasticsearch)
- GraphQL API
- Service mesh (Istio, Linkerd)
- Kubernetes deployment
- Multi-region deployment
- CQRS pattern
- Payment processing

## Success Criteria

- [ ] All services deployable independently
- [ ] API Gateway routes requests correctly
- [ ] Auth Service issues valid JWT tokens
- [ ] Posts Service handles CRUD operations
- [ ] Events flow between services via RabbitMQ
- [ ] Circuit breaker prevents cascading failures
- [ ] Health checks work for all services
- [ ] 80%+ test coverage across services
- [ ] All services start with docker-compose up
- [ ] System handles Auth Service downtime gracefully
- [ ] Distributed tracing works end-to-end
- [ ] Documentation complete for all APIs

## Risks and Mitigations

### Risk: Distributed System Complexity
**Mitigation**: Start simple, use proven patterns, extensive testing

### Risk: Data Consistency
**Mitigation**: Accept eventual consistency, implement compensating transactions

### Risk: Network Failures
**Mitigation**: Circuit breakers, retries, timeouts, fallbacks

### Risk: Debugging Difficulty
**Mitigation**: Centralized logging, distributed tracing, correlation IDs

### Risk: Service Versioning
**Mitigation**: API versioning, backward compatibility, feature flags

## Future Enhancements

- GraphQL federation
- Caching layer (Redis) for read-heavy endpoints
- Content Delivery Network (CDN)
- Elasticsearch for full-text search
- Notification service (email, push)
- Analytics service
- Admin dashboard service
- WebSocket gateway for real-time features
