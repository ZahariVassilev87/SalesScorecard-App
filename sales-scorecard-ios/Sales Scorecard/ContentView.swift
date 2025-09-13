import SwiftUI

struct ContentView: View {
    @StateObject private var authManager = AuthManager()
    
    var body: some View {
        Group {
            if authManager.isAuthenticated {
                RoleBasedView()
            } else {
                LoginView()
            }
        }
        .environmentObject(authManager)
    }
}

#Preview {
    ContentView()
}
