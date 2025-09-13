import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let displayName: String
    let role: String
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}