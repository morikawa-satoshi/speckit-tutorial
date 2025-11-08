# Blog Posts API - Specification

## Overview
RESTful API for managing blog posts with full CRUD capabilities, filtering, pagination, and search.

## Resource: Post

### Data Model
```javascript
{
  id: UUID,                    // Unique identifier
  title: string,               // Post title (1-200 chars, required)
  slug: string,                // URL-friendly version of title (unique)
  content: string,             // Post content (required, markdown supported)
  excerpt: string,             // Short summary (max 500 chars, auto-generated if empty)
  status: enum,                // 'draft' | 'published' | 'archived'
  authorId: UUID,              // Reference to User (required)
  categoryId: UUID,            // Reference to Category (optional)
  tags: string[],              // Array of tag names
  publishedAt: datetime,       // Publication timestamp (null if draft)
  createdAt: datetime,         // Creation timestamp
  updatedAt: datetime          // Last update timestamp
}
```

### Relationships
- **Author**: Many-to-One with User
- **Category**: Many-to-One with Category
- **Tags**: Many-to-Many (stored as array for simplicity)

## API Endpoints

### 1. List Posts
**GET** `/api/v1/posts`

**Description**: Retrieve a paginated list of posts

**Authentication**: Optional (drafts visible only to authenticated authors)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-based) |
| limit | integer | 10 | Items per page (max: 100) |
| status | string | published | Filter by status (all/draft/published/archived) |
| authorId | UUID | - | Filter by author |
| categoryId | UUID | - | Filter by category |
| tag | string | - | Filter by tag |
| search | string | - | Search in title and content |
| sort | string | -createdAt | Sort field(s), prefix - for desc |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-nodejs",
      "excerpt": "Learn the basics of Node.js...",
      "status": "published",
      "authorId": "660e8400-e29b-41d4-a716-446655440000",
      "author": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "categoryId": "770e8400-e29b-41d4-a716-446655440000",
      "category": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Programming"
      },
      "tags": ["nodejs", "javascript", "backend"],
      "publishedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Validation Rules**:
- `page` must be >= 1
- `limit` must be 1-100
- `status` must be one of: all, draft, published, archived
- `authorId`, `categoryId` must be valid UUIDs if provided
- `sort` accepts: createdAt, updatedAt, publishedAt, title (with optional - prefix)

---

### 2. Get Single Post
**GET** `/api/v1/posts/:id`

**Description**: Retrieve a specific post by ID

**Authentication**: Optional (draft posts require author authentication)

**Path Parameters**:
- `id` (UUID): Post ID

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "content": "# Introduction\n\nNode.js is...",
    "excerpt": "Learn the basics of Node.js...",
    "status": "published",
    "authorId": "660e8400-e29b-41d4-a716-446655440000",
    "author": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "category": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Programming",
      "slug": "programming"
    },
    "tags": ["nodejs", "javascript", "backend"],
    "publishedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Post doesn't exist
- `403 Forbidden`: Trying to access someone else's draft

---

### 3. Create Post
**POST** `/api/v1/posts`

**Description**: Create a new blog post

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "title": "Getting Started with Node.js",
  "content": "# Introduction\n\nNode.js is...",
  "excerpt": "Learn the basics of Node.js...",  // Optional
  "status": "draft",                            // Optional, default: draft
  "categoryId": "770e8400-e29b-41d4-a716-446655440000",  // Optional
  "tags": ["nodejs", "javascript", "backend"]    // Optional
}
```

**Validation Rules**:
- `title`: required, 1-200 characters, trimmed
- `content`: required, minimum 10 characters
- `excerpt`: optional, max 500 characters (auto-generated from content if not provided)
- `status`: optional, one of: draft, published (default: draft)
- `categoryId`: optional, must be valid existing category UUID
- `tags`: optional, array of strings (max 10 tags, each max 50 chars)
- `slug`: auto-generated from title (must be unique)
- `authorId`: auto-set from authenticated user

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "content": "# Introduction\n\nNode.js is...",
    "excerpt": "Learn the basics of Node.js...",
    "status": "draft",
    "authorId": "660e8400-e29b-41d4-a716-446655440000",
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "tags": ["nodejs", "javascript", "backend"],
    "publishedAt": null,
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `409 Conflict`: Slug already exists

---

### 4. Update Post
**PUT** `/api/v1/posts/:id`

**Description**: Update an existing post

**Authentication**: Required (must be post author or admin)

**Path Parameters**:
- `id` (UUID): Post ID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "status": "published",
  "categoryId": "770e8400-e29b-41d4-a716-446655440000",
  "tags": ["nodejs", "javascript"]
}
```

**Validation Rules**:
- Same as create endpoint for provided fields
- `slug` regenerated if title changes (ensures uniqueness)
- `publishedAt` auto-set when status changes from draft to published

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Title",
    "slug": "updated-title",
    "content": "Updated content...",
    "excerpt": "Updated excerpt",
    "status": "published",
    "authorId": "660e8400-e29b-41d4-a716-446655440000",
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "tags": ["nodejs", "javascript"],
    "publishedAt": "2024-01-15T11:00:00Z",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not the post author
- `404 Not Found`: Post doesn't exist
- `409 Conflict`: New slug already exists

---

### 5. Delete Post
**DELETE** `/api/v1/posts/:id`

**Description**: Delete a post (soft delete: archives the post)

**Authentication**: Required (must be post author or admin)

**Path Parameters**:
- `id` (UUID): Post ID

**Response (204 No Content)**:
No body

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not the post author
- `404 Not Found`: Post doesn't exist

**Note**: This performs a soft delete (sets status to 'archived'). For hard delete, admin access required.

---

## Business Rules

### Slug Generation
- Auto-generated from title
- Lowercase, alphanumeric + hyphens only
- Must be unique across all posts
- If duplicate, append `-2`, `-3`, etc.

### Excerpt Generation
- If not provided, extract first 200 characters from content
- Strip markdown formatting
- Add "..." if truncated

### Publishing Workflow
1. Post created as draft by default
2. Author can update draft multiple times
3. When status changes to 'published', `publishedAt` is set
4. Published posts can be edited (updates `updatedAt`)
5. Published posts can be archived
6. Archived posts can be republished

### Visibility Rules
- **Draft posts**: Only visible to author (when authenticated)
- **Published posts**: Visible to everyone
- **Archived posts**: Only visible to author and admins

### Authorization Rules
- Anyone can view published posts (no auth required)
- Authors can view their own drafts/archived posts
- Authors can create posts
- Authors can edit/delete only their own posts
- Admins can edit/delete any post

## Search Implementation
- Search query matches title and content (case-insensitive)
- Uses simple LIKE query (can be upgraded to full-text search later)
- Returns ranked by relevance (title matches > content matches)

## Performance Considerations
- Index on: slug, authorId, categoryId, status, publishedAt
- Eager load author and category data for list views
- Content excluded from list views (only excerpt shown)
- Pagination enforced (max 100 items per page)

## Error Scenarios

### Validation Errors (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 1 and 200 characters"
      },
      {
        "field": "tags",
        "message": "Maximum 10 tags allowed"
      }
    ]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  }
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this post"
  }
}
```

### Conflict (409)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A post with this slug already exists",
    "details": {
      "field": "slug",
      "value": "getting-started-with-nodejs"
    }
  }
}
```

## Testing Requirements

### Unit Tests
- Slug generation from various titles
- Excerpt auto-generation
- Validation rules for all fields

### Integration Tests
- Create post as authenticated user
- Update own post
- Attempt to update another user's post (should fail)
- Delete own post
- List posts with various filters
- Search functionality
- Pagination
- Draft visibility rules

## Success Criteria
- [ ] All endpoints implemented and tested
- [ ] Slug generation working correctly
- [ ] Auto excerpt generation functional
- [ ] Pagination working with proper metadata
- [ ] Filtering by status, author, category, tags
- [ ] Search returns relevant results
- [ ] Authorization rules enforced
- [ ] Validation errors clear and helpful
- [ ] Performance acceptable with 1000+ posts
