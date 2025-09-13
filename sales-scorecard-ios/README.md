# Sales Scorecard iOS App

## How to Create the Xcode Project

Since we can't create a proper Xcode project from the command line without full Xcode installation, here's how to set it up:

### Step 1: Create New Xcode Project
1. Open **Xcode**
2. Choose **"Create a new Xcode project"**
3. Select **iOS** → **App**
4. Fill in the details:
   - **Product Name**: `SalesScorecard`
   - **Interface**: `SwiftUI`
   - **Language**: `Swift`
   - **Bundle Identifier**: `com.instorm.sales-scorecard`
5. Choose a location and create the project

### Step 2: Add Our Files
Once the project is created, replace the default files with our custom ones:

1. **Replace `App.swift`** with our version
2. **Replace `ContentView.swift`** with our version
3. **Add our Models, Views, and Services folders**

### Step 3: Project Structure
Your final project should look like this:

```
SalesScorecard/
├── App.swift
├── ContentView.swift
├── Models/
│   ├── User.swift
│   └── Evaluation.swift
├── Views/
│   ├── LoginView.swift
│   ├── DashboardView.swift
│   ├── EvaluationsView.swift
│   ├── NewEvaluationView.swift
│   └── ProfileView.swift
└── Services/
    ├── AuthManager.swift
    ├── APIService.swift
    └── KeychainService.swift
```

## Alternative: Use the Files We Created

All the Swift files are ready in the `SalesScorecard/` folder. You can:

1. Create a new Xcode project
2. Copy our files into it
3. Build and run

## Next Steps

1. Create the Xcode project as described above
2. Add our Swift files
3. Update the API endpoint in `APIService.swift` to point to your backend
4. Build and test the app

The backend API is already running and ready to use!
