import Foundation

struct Region: Identifiable, Codable {
    let id: String
    let name: String
    let createdAt: String?
    let updatedAt: String?
    let managers: [User]?
    
    init(id: String, name: String, createdAt: String? = nil, updatedAt: String? = nil, managers: [User]? = nil) {
        self.id = id
        self.name = name
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.managers = managers
    }
    
    // Computed property to get Sales Directors for this region
    var salesDirectors: [User] {
        return managers?.filter { $0.isSalesDirector } ?? []
    }
    
    // Computed property to get Regional Managers for this region
    var regionalManagers: [User] {
        return managers?.filter { $0.isRegionalManager } ?? []
    }
}//
//  Region.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

