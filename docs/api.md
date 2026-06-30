# API Reference (Work in Progress)

> This document reflects routes **currently implemented** in the codebase. Endpoints may change, be added, or removed as the project evolves. It is not a final or complete API spec.

Base URL: `/api/v1`

## Authentication

Protected routes accept an access token via:

- `accessToken` httpOnly cookie (set on login)
- `Authorization: Bearer <token>` header
- `accessToken` in the request body

Login sets both `accessToken` and `refreshToken` cookies. Use `PATCH /users/refresh-token` to renew an expired access token.

## Response Format

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {},
  "success": true
}
```

Errors are returned by the global error middleware with an appropriate status code and message.

---

## Health Check

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/healthcheck` | No |

## Users (`/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register (multipart: `avatar`, `coverImage`) |
| GET | `/login` | No | Login with email/username + password |
| PATCH | `/refresh-token` | No | Refresh access token |
| POST | `/logout` | Yes | Logout |
| PATCH | `/change-password` | Yes | Change password |
| GET | `/get-user` | Yes | Get current user |
| PATCH | `/change-account-details` | Yes | Update account details |
| PATCH | `/change-avatar` | Yes | Update avatar (multipart: `avatar`) |
| PATCH | `/change-cover-image` | Yes | Update cover image (multipart: `coverImage`) |
| GET | `/get-channel-profile/:username` | Yes | Get channel profile |
| GET | `/history` | Yes | Get watch history |

## Videos (`/video`)

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List videos |
| POST | `/` | Publish video (multipart: `videoFile`, `thumbnail`) |
| GET | `/:videoId` | Get video by ID |
| PATCH | `/:videoId` | Update video (optional `thumbnail`) |
| DELETE | `/:videoId` | Delete video |
| PATCH | `/toggle/publish/:videoId` | Toggle publish status |

## Comments (`/comments`)

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:videoId` | Get comments for a video |
| POST | `/:videoId` | Add a comment |
| PATCH | `/c/:commentId` | Update a comment |
| DELETE | `/c/:commentId` | Delete a comment |

## Dashboard (`/dashboard`)

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Channel statistics |
| GET | `/videos` | Channel videos |
