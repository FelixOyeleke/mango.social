# Mango Social API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "createdAt": "2026-01-09T00:00:00.000Z"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:** Same as register

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Users

### Get User Profile
```http
GET /users/:username
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "string",
  "bio": "string",
  "location": "string",
  "website": "string"
}
```

### Upload Avatar
```http
POST /users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

### Upload Banner
```http
POST /users/banner
Authorization: Bearer <token>
Content-Type: multipart/form-data

banner: <file>
```

### Follow User
```http
POST /users/:userId/follow
Authorization: Bearer <token>
```

### Unfollow User
```http
DELETE /users/:userId/follow
Authorization: Bearer <token>
```

### Get Followers
```http
GET /users/:userId/followers
```

### Get Following
```http
GET /users/:userId/following
```

## Posts/Stories

### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "image": "base64_string (optional)",
  "poll": {
    "question": "string",
    "options": ["option1", "option2"]
  } (optional)
}
```

### Get Feed
```http
GET /posts/feed?page=1&limit=10
Authorization: Bearer <token>
```

### Get Post by ID
```http
GET /posts/:postId
```

### Like Post
```http
POST /posts/:postId/like
Authorization: Bearer <token>
```

### Unlike Post
```http
DELETE /posts/:postId/like
Authorization: Bearer <token>
```

### Repost
```http
POST /posts/:postId/repost
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "string (optional)"
}
```

### Comment on Post
```http
POST /posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string"
}
```

### Bookmark Post
```http
POST /posts/:postId/bookmark
Authorization: Bearer <token>
```

### Get Bookmarks
```http
GET /posts/bookmarks
Authorization: Bearer <token>
```

## Jobs

### Get All Jobs
```http
GET /jobs?page=1&limit=10&visaSponsorship=true&location=string
```

### Get Job by ID
```http
GET /jobs/:jobId
```

### Create Job
```http
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "company": "string",
  "location": "string",
  "description": "string",
  "requirements": "string",
  "salary": "string",
  "jobType": "full-time|part-time|contract|internship",
  "visaSponsorship": boolean,
  "applicationUrl": "string"
}
```

### Update Job
```http
PUT /jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Job
```http
DELETE /jobs/:jobId
Authorization: Bearer <token>
```

### Save Job
```http
POST /jobs/:jobId/save
Authorization: Bearer <token>
```

### Get Saved Jobs
```http
GET /jobs/saved
Authorization: Bearer <token>
```

## App Preferences

### Get User App Preferences
```http
GET /apps/preferences
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobs": true,
  "dating": false,
  "marketplace": true,
  "resources": true,
  "events": true,
  "communities": true
}
```

### Update App Preferences
```http
PUT /apps/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobs": boolean,
  "dating": boolean,
  "marketplace": boolean,
  "resources": boolean,
  "events": boolean,
  "communities": boolean
}
```

## Messaging

### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer <token>
```

### Get Messages
```http
GET /messages/:conversationId
Authorization: Bearer <token>
```

### Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": number,
  "content": "string"
}
```

### Create Group Chat
```http
POST /messages/group
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "participantIds": [1, 2, 3]
}
```

## Search

### Search All
```http
GET /search?q=query&type=all|users|posts|hashtags
```

### Get Trending Hashtags
```http
GET /search/trending
```

## Admin

### Get All Users (Admin)
```http
GET /admin/users?page=1&limit=10
Authorization: Bearer <token>
```

### Update User Role (Admin)
```http
PUT /admin/users/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "user|admin|moderator"
}
```

### Delete User (Admin)
```http
DELETE /admin/users/:userId
Authorization: Bearer <token>
```

### Get Platform Statistics (Admin)
```http
GET /admin/stats
Authorization: Bearer <token>
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 per window

When rate limit is exceeded:
```json
{
  "error": "Too many requests, please try again later"
}
```


