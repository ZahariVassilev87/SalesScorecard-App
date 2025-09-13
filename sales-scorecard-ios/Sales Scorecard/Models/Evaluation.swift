import Foundation

struct BehaviorCategory: Codable, Identifiable {
    let id: String
    let name: String
    let weight: Double
    let order: Int
    let items: [BehaviorItem]
}

struct BehaviorItem: Codable, Identifiable {
    let id: String
    let name: String
    let order: Int
    let isActive: Bool
    let categoryId: String
}

struct Salesperson: Codable, Identifiable {
    let id: String
    let firstName: String
    let lastName: String
    let email: String
    let teamId: String
    let isActive: Bool
    let createdAt: String?
    let updatedAt: String?
    
    init(id: String, firstName: String, lastName: String, email: String, teamId: String, isActive: Bool = true, createdAt: String? = nil, updatedAt: String? = nil) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.teamId = teamId
        self.isActive = isActive
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

struct Evaluation: Codable, Identifiable {
    let id: String
    let salespersonId: String
    let managerId: String
    let visitDate: String
    let location: String?
    let overallScore: Double?
    let notes: String?
    let createdAt: String
    let updatedAt: String
    let salesperson: Salesperson?
    
    init(id: String, salespersonId: String, managerId: String, visitDate: String, location: String? = nil, overallScore: Double? = nil, notes: String? = nil, createdAt: String, updatedAt: String, salesperson: Salesperson? = nil) {
        self.id = id
        self.salespersonId = salespersonId
        self.managerId = managerId
        self.visitDate = visitDate
        self.location = location
        self.overallScore = overallScore
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.salesperson = salesperson
    }
}

struct EvaluationItem: Codable, Identifiable {
    let id: String
    let evaluationId: String
    let behaviorItemId: String
    let rating: Int
    let comment: String?
}

// MARK: - API Request/Response Models
struct EvaluationSubmission: Codable {
    let salespersonId: String
    let visitDate: String
    let location: String?
    let overallComment: String?
    let items: [EvaluationItemSubmission]
}

struct EvaluationItemSubmission: Codable {
    let behaviorItemId: String
    let rating: Int
    let comment: String?
}
