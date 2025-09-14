import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let displayName: String
    let role: String
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
    let managedRegions: [Region]?
    
    // Computed property to check if user is a Sales Director
    var isSalesDirector: Bool {
        return role == "SALES_DIRECTOR"
    }
    
    // Computed property to check if user is a Regional Manager
    var isRegionalManager: Bool {
        return role == "REGIONAL_SALES_MANAGER"
    }
    
    // Computed property to check if user is a Sales Lead
    var isSalesLead: Bool {
        return role == "SALES_LEAD"
    }
    
    // Computed property to check if user is a Salesperson
    var isSalesperson: Bool {
        return role == "SALESPERSON"
    }
    
    // Computed property to check if user is an Admin
    var isAdmin: Bool {
        return role == "ADMIN"
    }
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}