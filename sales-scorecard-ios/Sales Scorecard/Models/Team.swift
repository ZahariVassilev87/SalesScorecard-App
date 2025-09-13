import Foundation

struct Team: Identifiable, Codable {
    let id: String
    let name: String
    let regionId: String
    let createdAt: String?
    let updatedAt: String?
    
    init(id: String, name: String, regionId: String, createdAt: String? = nil, updatedAt: String? = nil) {
        self.id = id
        self.name = name
        self.regionId = regionId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}//
//  Team.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

