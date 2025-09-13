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
}

struct EvaluationItem: Codable, Identifiable {
    let id: String
    let evaluationId: String
    let behaviorItemId: String
    let rating: Int
    let comment: String?
}