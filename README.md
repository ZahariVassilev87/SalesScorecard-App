# Sales Scorecard

A comprehensive sales behavior evaluation and analytics platform for sales managers.

## Project Structure

```
SalesScorecard/
├── sales-scorecard-api/          # Backend API (NestJS + Prisma + PostgreSQL)
├── sales-scorecard-ios/          # iOS App (SwiftUI)
└── README.md
```

## Features

### ✅ Completed (MVP Phase 1)
- **Authentication**: Magic link email authentication
- **User Management**: Role-based access control (Admin, Sales Director, Regional Sales Manager, Sales Manager, Sales Lead, Salesperson)
- **Organization Structure**: Regions, Teams, Salespeople hierarchy
- **Basic API**: RESTful endpoints for all entities
- **iOS App**: SwiftUI app with login, dashboard, and basic navigation
- **Security**: JWT tokens, secure keychain storage

### 🚧 In Progress (Phase 2)
- **Scoring System**: Behavioral categories and rating scales
- **Evaluation Forms**: Create and submit evaluations
- **Data Persistence**: Core Data integration
- **Analytics**: Charts and trend analysis

### 📋 Planned (Phase 3)
- **Advanced Analytics**: Swift Charts integration
- **Export Features**: CSV and PDF reports
- **Offline Support**: Sync capabilities
- **Push Notifications**: Real-time updates

## Quick Start

### Backend API Setup

1. **Install Dependencies**
   ```bash
   cd sales-scorecard-api
   npm install
   ```

2. **Database Setup**
   ```bash
   # Install PostgreSQL and create database
   createdb sales_scorecard
   
   # Run Prisma migrations
   npx prisma migrate dev
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your database URL and other settings
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

   API will be available at: `http://localhost:3000`
   Documentation: `http://localhost:3000/api/docs`

### iOS App Setup

1. **Open in Xcode**
   ```bash
   cd sales-scorecard-ios
   open SalesScorecard.xcodeproj
   ```

2. **Configure API Endpoint**
   - Update `APIService.swift` with your backend URL
   - Set up proper signing and provisioning

3. **Build and Run**
   - Select your target device/simulator
   - Build and run the project

## API Endpoints

### Authentication
- `POST /auth/magic-link` - Send magic link to email
- `POST /auth/verify` - Verify magic link token
- `GET /auth/me` - Get current user profile

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID

### Organizations
- `GET /organizations/regions` - Get all regions
- `GET /organizations/teams` - Get all teams
- `GET /organizations/salespeople` - Get all salespeople

### Evaluations
- `GET /evaluations` - Get all evaluations
- `GET /evaluations/:id` - Get evaluation by ID

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/trends` - Get trend data

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, settings |
| **Sales Director** | All regions, team management, analytics |
| **Regional Sales Manager** | Assigned regions, team oversight |
| **Sales Manager** | Assigned teams, create evaluations |
| **Sales Lead** | Read-only access, coaching notes |
| **Salesperson** | View own evaluations, basic profile |

## Magic Link Authentication

1. User enters email address
2. System sends magic link to email (15-minute expiry)
3. User clicks link to authenticate
4. JWT token stored securely in iOS Keychain

## Database Schema

### Core Entities
- **Users**: Authentication and role management
- **Regions**: Geographic or organizational divisions
- **Teams**: Groups within regions
- **Salespeople**: Individual sales representatives
- **Evaluations**: Behavioral assessments
- **Behavior Categories**: Scoring rubrics
- **Audit Logs**: Activity tracking

## Development Status

### Phase 1: Foundation ✅
- [x] Backend API structure
- [x] Database schema
- [x] Authentication system
- [x] iOS app foundation
- [x] Basic navigation

### Phase 2: Core Features 🚧
- [ ] Scoring categories and items
- [ ] Evaluation creation flow
- [ ] Data persistence
- [ ] Basic analytics

### Phase 3: Advanced Features 📋
- [ ] Charts and visualizations
- [ ] Export functionality
- [ ] Offline support
- [ ] Push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

Private project - All rights reserved

## Support

For questions or support, contact: zahari.vasilev@instorm.bg
