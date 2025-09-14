import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var token = ""
    @State private var showTokenInput = false
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        VStack(spacing: 30) {
            // Header
            VStack(spacing: 16) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text("Sales Scorecard")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Sign in to continue")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 50)
            
            Spacer()
            
            // Login Form
            VStack(spacing: 20) {
                if !showTokenInput {
                    // Email Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email Address")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextField("Enter your email", text: $email)
                            .textFieldStyle(.roundedBorder)
                    }
                    
                    // Send Magic Link Button
                    Button(action: sendMagicLink) {
                        HStack {
                            if authManager.isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "envelope")
                            }
                            Text(authManager.isLoading ? "Sending..." : "Send Magic Link")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(authManager.isLoading || email.isEmpty)
                    .opacity(authManager.isLoading || email.isEmpty ? 0.6 : 1.0)
                } else {
                    // Token Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Verification Code")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextField("Enter verification code", text: $token)
                            .textFieldStyle(.roundedBorder)
                    }
                    
                    // Verify Token Button
                    Button(action: verifyToken) {
                        HStack {
                            if authManager.isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "checkmark.circle")
                            }
                            Text(authManager.isLoading ? "Verifying..." : "Verify Code")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(authManager.isLoading || token.isEmpty)
                    .opacity(authManager.isLoading || token.isEmpty ? 0.6 : 1.0)
                }
                
                // Back Button (when showing token input)
                if showTokenInput {
                    Button("Back to Email") {
                        showTokenInput = false
                        token = ""
                    }
                    .foregroundColor(.blue)
                }
                
                // Test Mode Button (for simulator testing)
                if !showTokenInput {
                    Button("Test Mode - Skip Authentication") {
                        // Create a test user for development
                        let testUser = User(
                            id: "test-1",
                            email: "test@instorm.bg",
                            displayName: "Test User",
                            role: "ADMIN",
                            isActive: true,
                            createdAt: "2024-01-01T00:00:00Z",
                            updatedAt: "2024-01-01T00:00:00Z",
                            managedRegions: nil
                        )
                        authManager.currentUser = testUser
                        authManager.isAuthenticated = true
                    }
                    .foregroundColor(.orange)
                    .font(.caption)
                }
            }
            .padding(.horizontal, 30)
            
            Spacer()
            
            // Footer
            VStack(spacing: 8) {
                Text("Magic Link Authentication")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text("Check your email for the verification code")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.bottom, 30)
        }
        .alert("Error", isPresented: $showAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
        .onChange(of: authManager.errorMessage) { _, errorMessage in
            if let error = errorMessage {
                alertMessage = error
                showAlert = true
            }
        }
    }
    
    private func sendMagicLink() {
        authManager.sendMagicLink(email: email)
        
        // Show token input after successful magic link send
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            if authManager.errorMessage == nil {
                showTokenInput = true
            }
        }
    }
    
    private func verifyToken() {
        authManager.verifyMagicLink(token: token)
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthManager())
}
