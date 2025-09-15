import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var displayName = ""
    @State private var showRegistration = false
    
    var body: some View {
        VStack(spacing: 30) {
            // Header
            VStack(spacing: 16) {
                Image(systemName: "chart.bar.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("Sales Scorecard")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Evaluate sales performance with precision")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            // Login Form
            VStack(spacing: 20) {
                if showRegistration {
                    // Registration Form
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Display Name")
                                .font(.headline)
                            
                            TextField("Enter your name", text: $displayName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email Address")
                                .font(.headline)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.headline)
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        Button(action: registerWithPassword) {
                            HStack {
                                if authManager.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                }
                                Text(authManager.isLoading ? "Registering..." : "Register")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(email.isEmpty || password.isEmpty || displayName.isEmpty || authManager.isLoading)
                        
                        Button(action: { showRegistration = false }) {
                            Text("Already have an account? Sign In")
                                .foregroundColor(.blue)
                        }
                    }
                } else {
                    // Password Login Form (Default)
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email Address")
                                .font(.headline)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.headline)
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        Button(action: loginWithPassword) {
                            HStack {
                                if authManager.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                }
                                Text(authManager.isLoading ? "Signing In..." : "Sign In")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(email.isEmpty || password.isEmpty || authManager.isLoading)
                        
                        Button(action: { showRegistration = true }) {
                            Text("Don't have an account? Register")
                                .foregroundColor(.blue)
                        }
                    }
                }
            }
            
            // Error Message
            if let errorMessage = authManager.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
        }
        .padding()
    }
    
    private func loginWithPassword() {
        authManager.loginWithPassword(email: email, password: password)
    }
    
    private func registerWithPassword() {
        authManager.registerWithPassword(email: email, password: password, displayName: displayName)
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthManager())
}