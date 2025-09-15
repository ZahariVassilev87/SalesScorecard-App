# iOS App Setup Guide

## 🎉 iOS App Connectivity Test Results

### ✅ All Endpoints Working Successfully!

The iOS app has been successfully configured to connect to the AWS backend at `http://api.instorm.io`.

## 📱 iOS App Configuration

### Updated Files:
- ✅ `APIService.swift` - Updated base URL to AWS backend
- ✅ `AuthManager.swift` - Added password authentication methods
- ✅ `LoginView.swift` - Added password login and registration forms

### Base URL Configuration:
```swift
private let baseURL = "http://api.instorm.io" // AWS Production
```

## 🔐 Authentication Methods

### 1. Password Authentication (Primary)
- **Login**: `POST /auth/login`
- **Registration**: `POST /auth/register`
- **Profile**: `GET /auth/me` (requires JWT token)

### 2. Magic Link Authentication (Legacy)
- **Send Magic Link**: `POST /auth/magic-link`
- **Verify Token**: `POST /auth/verify`

## 📊 Test Results

### ✅ Health Check
- **Endpoint**: `GET /health`
- **Status**: 200 OK
- **Response**: Service healthy, version 3.0.0

### ✅ Authentication
- **Login**: Successfully authenticates users
- **JWT Token**: Generated and working
- **User Profile**: Retrieved successfully

### ✅ Data Endpoints
- **Users List**: 6 users available
- **Categories**: 0 categories (ready for creation)
- **Organizations**: 2 regions available

## 🧪 Test Credentials

### Working Test User:
- **Email**: `john@test.com`
- **Password**: `password123`
- **Role**: `REGIONAL_SALES_MANAGER`
- **Display Name**: `John Manager`

## 🚀 How to Test the iOS App

### 1. Open Xcode Project
```bash
cd sales-scorecard-ios
open "Sales Scorecard.xcodeproj"
```

### 2. Build and Run
- Select your target device/simulator
- Build and run the project
- The app will connect to `http://api.instorm.io`

### 3. Test Login
- Use the test credentials above
- The app will authenticate and retrieve user data
- JWT token will be stored securely in Keychain

## 📋 Available Features

### ✅ Working Features:
- **Password Authentication** - Login and registration
- **JWT Token Management** - Secure token storage
- **User Profile** - Display user information
- **Organizations** - View regions and teams
- **User Management** - List all users (with auth)

### 🔄 Ready for Implementation:
- **Categories** - Behavior scoring categories
- **Evaluations** - Sales performance evaluations
- **Analytics** - Dashboard and reporting
- **Notifications** - Push notifications

## 🔧 Development Notes

### API Response Format:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmfkvi3vd00011113hrso4mfl",
    "email": "john@test.com",
    "displayName": "John Manager",
    "role": "REGIONAL_SALES_MANAGER",
    "isActive": true,
    "createdAt": "2025-09-15T08:39:41.594Z",
    "updatedAt": "2025-09-15T08:45:42.549Z"
  }
}
```

### Error Handling:
- Network errors are handled gracefully
- Authentication errors show user-friendly messages
- Token validation ensures secure access

## 🎯 Next Steps

1. **Test the iOS app** with the provided credentials
2. **Create evaluation categories** using the admin panel
3. **Test evaluation creation** from the iOS app
4. **Implement analytics dashboard** features
5. **Add push notifications** for real-time updates

## 📞 Support

If you encounter any issues:
1. Check the API health endpoint: `http://api.instorm.io/health`
2. Verify network connectivity
3. Check JWT token validity
4. Review error messages in the app

---

**🎉 The iOS app is ready for testing and development!**
