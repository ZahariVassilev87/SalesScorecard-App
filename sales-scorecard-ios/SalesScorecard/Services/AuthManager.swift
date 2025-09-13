import Foundation
import Combine

class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    private let keychainService = KeychainService()
    
    init() {
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        if let token = keychainService.getToken() {
            // Validate token with backend
            validateToken(token)
        }
    }
    
    func sendMagicLink(email: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.sendMagicLink(email: email) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success:
                    // Show success message
                    break
                case .failure(let error):
                    self?.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func verifyMagicLink(token: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.verifyMagicLink(token: token) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success(let authResponse):
                    self?.keychainService.saveToken(authResponse.token)
                    self?.currentUser = authResponse.user
                    self?.isAuthenticated = true
                case .failure(let error):
                    self?.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    private func validateToken(_ token: String) {
        apiService.validateToken(token: token) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let user):
                    self?.currentUser = user
                    self?.isAuthenticated = true
                case .failure:
                    self?.keychainService.deleteToken()
                    self?.isAuthenticated = false
                }
            }
        }
    }
    
    func logout() {
        keychainService.deleteToken()
        currentUser = nil
        isAuthenticated = false
    }
}