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
    
    // Role hierarchy level (higher number = more permissions)
    var roleLevel: Int {
        switch role {
        case "ADMIN": return 5
        case "SALES_DIRECTOR": return 4
        case "REGIONAL_SALES_MANAGER": return 3
        case "SALES_LEAD": return 2
        case "SALESPERSON": return 1
        default: return 0
        }
    }
    
    // Check if user has role level or higher
    func hasRoleOrHigher(_ requiredRole: String) -> Bool {
        let requiredLevel: Int
        switch requiredRole {
        case "ADMIN": requiredLevel = 5
        case "SALES_DIRECTOR": requiredLevel = 4
        case "REGIONAL_SALES_MANAGER": requiredLevel = 3
        case "SALES_LEAD": requiredLevel = 2
        case "SALESPERSON": requiredLevel = 1
        default: requiredLevel = 0
        }
        return roleLevel >= requiredLevel
    }
    
    // Check if user can manage other users
    var canManageUsers: Bool {
        return hasRoleOrHigher("SALES_LEAD")
    }
    
    // Check if user can view reports
    var canViewReports: Bool {
        return hasRoleOrHigher("SALESPERSON")
    }
    
    // Check if user can create evaluations
    var canCreateEvaluations: Bool {
        return hasRoleOrHigher("SALES_LEAD")
    }
    
    // Check if user can view analytics
    var canViewAnalytics: Bool {
        return hasRoleOrHigher("REGIONAL_SALES_MANAGER")
    }
}

struct AuthResponse: Codable {
    let user: User
    let access_token: String
    
    // Computed property for backward compatibility
    var token: String {
        return access_token
    }
}