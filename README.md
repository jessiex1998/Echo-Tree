# Echo Tree 🌳

A gentle web application where you can talk to a wise, non-judgmental tree.

## Project Overview

Echo Tree is a web application built on the MERN stack (MongoDB, Express, React, Node.js) that allows users to:

- Have private conversations with an AI tree for calm, context-aware reflections
- Anonymously post notes to a public "tree hole"
- Act as "healers" to provide supportive replies to others
- Track emotional patterns and receive gentle summaries

## User Types

1. **Visitor** - Can browse the tree hole and send one trial message
2. **Teller** - Can have private conversations with the tree and share anonymous notes
3. **Healer** - Can reply to others' notes (after passing an empathy test)

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Anthropic Claude API (AI features)
- bcryptjs (Password encryption)

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- Axios

## Project Structure

```
EchoTree/
├── backend/
│   ├── config/          # Database and environment configuration
│   ├── middleware/       # Authentication, error handling, rate limiting
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions (AI service, etc.)
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── services/    # API calls
│   │   ├── context/     # React Context
│   │   └── hooks/       # Custom Hooks
│   └── public/
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- MongoDB
- Anthropic API Key

### Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install-all

# Or install separately
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Environment Configuration

1. Copy the backend environment variables example file:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` and fill in:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `ANTHROPIC_API_KEY` - Anthropic API key
- Other configuration items

### Run Development Server

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run server  # Backend (port 3000)
npm run client  # Frontend (port 5173)
```

### Run Tests

```bash
# Backend: Jest + Supertest
cd backend && npm test

# Frontend: Vitest + Testing Library
cd ../frontend && npm run test
```

### Docker Deployment (Backend)

```bash
cd backend
docker build -t echotree-backend .
docker run -p 3000:3000 --env-file .env echotree-backend
```

## API Endpoints

### Authentication
- `POST /api/sessions` - Login
- `DELETE /api/sessions/:sessionId` - Logout
- `GET /api/sessions/:sessionId` - Validate session

### Users
- `POST /api/users` - Register
- `GET /api/users/:userId` - Get user information
- `PATCH /api/users/:userId` - Update user information
- `DELETE /api/users/:userId` - Delete user

### Chats
- `POST /api/chats` - Create new chat
- `GET /api/chats` - Get all chats (pagination, sorting, filtering)
- `GET /api/chats/:chatId` - Get specific chat
- `PATCH /api/chats/:chatId` - Update chat
- `DELETE /api/chats/:chatId` - Delete chat
- `POST /api/chats/:chatId/messages` - Send message
- `GET /api/chats/:chatId/messages` - Get chat messages

### Messages
- `GET /api/messages/:messageId` - Get specific message
- `PATCH /api/messages/:messageId` - Update message
- `DELETE /api/messages/:messageId` - Delete message

### Feeling Labels
- `POST /api/chats/:chatId/messages/:messageId/feelings` - Add feeling label
- `GET /api/chats/:chatId/messages/:messageId/feelings` - Get feeling labels

### Notes (Tree Hole)
- `POST /api/notes` - Create note from chat
- `GET /api/notes` - Get note list (pagination, sorting, filtering)
- `GET /api/notes/:noteId` - Get specific note
- `PATCH /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note
- `POST /api/notes/:noteId/images` - Add image
- `GET /api/notes/:noteId/images` - Get note images
- `POST /api/notes/:noteId/topics` - Add topic tags
- `GET /api/notes/:noteId/topics` - Get topic tags
- `GET /api/notes/:noteId/replies` - Get note replies

### Replies
- `POST /api/replies` - Create reply (Healer only)
- `GET /api/replies` - Get reply list
- `GET /api/replies/:replyId` - Get specific reply
- `PATCH /api/replies/:replyId` - Update reply (5-minute window)
- `DELETE /api/replies/:replyId` - Delete reply
- `POST /api/replies/:replyId/reactions` - Add reaction
- `GET /api/replies/:replyId/reactions` - Get reactions

### Digests & Analytics
- `POST /api/digests` - Generate digest
- `GET /api/digests` - Get user digest list
- `GET /api/digests/:digestId` - Get specific digest
- `GET /api/digests/:digestId/trends` - Get trend data
- `GET /api/digests/:digestId/metrics` - Get engagement metrics
- `GET /api/digests/users/:userId/trends` - Get user trends
- `GET /api/digests/users/:userId/metrics` - Get user metrics

### Healer Quiz
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/take` - Take quiz
- `GET /api/quiz/:userId/status` - Get quiz status

## Core Features

### Service 2: Chat & Message Service (Core)
- ✅ Complete CRUD operations
- ✅ Three resources: Chat, Message, FeelingLabel
- ✅ Complete API endpoints
- ✅ Access control (visitor restrictions, user permissions)
- ✅ AI integration for Tree responses
- ✅ Pagination, sorting, filtering
- ✅ Emotion tracking (mood, energy, feeling labels)

### Service 1: User Management Service
- ✅ User authentication and authorization
- ✅ Healer penalty system
- ✅ Session management

### Service 3: Note & Tree Hole Service
- ✅ Create anonymous notes from chats
- ✅ Public/private visibility control
- ✅ Topic tag system
- ✅ Image support (generation/upload)
- ✅ View count and reply count

### Service 4: Reply Management Service
- ✅ Healer reply functionality
- ✅ Content moderation and penalty system
- ✅ 5-minute edit window
- ✅ Reply reaction system (like, support, helpful)

### Service 5: Analytics & Digest Service
- ✅ Weekly/monthly report generation
- ✅ Mood/energy trend analysis
- ✅ Emotion pattern aggregation
- ✅ Engagement metrics tracking

### Healer Quiz Service
- ✅ Empathy quiz (5 questions, 80% passing)
- ✅ 24-hour retake restriction
- ✅ Auto-promotion to Healer upon passing

## Development Status

- [x] Phase 1: Project initialization and infrastructure
- [x] Phase 2: Chat & Message Service (core functionality)
- [x] Phase 3: User Management Service
- [x] Phase 4: Frontend core pages and components
- [x] Phase 5: AI integration and core features (basic completion)
- [x] Phase 6: Additional services and features
- [ ] Phase 7: Testing and deployment preparation
- [ ] Phase 8: Final optimization and special features

## Important Notes

1. **AI API Key**: Anthropic API key required to use Claude AI features
2. **Database**: Ensure MongoDB is properly configured
3. **Environment Variables**: All sensitive information managed through .env
4. **Visitor Restrictions**: Visitors can only create 1 trial chat and send 1 message

## Admin Account

**Username**: `admin`
**Password**: `admin123456`
**Email**: `admin@echotree.com`

⚠️ **Important**: Change the admin password before deploying to production!

## License

ISC
