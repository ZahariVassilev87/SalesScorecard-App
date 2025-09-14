import Foundation

struct Team: Identifiable, Codable {
    let id: String
    let name: String
    let regionId: String
    let createdAt: String?
    let updatedAt: String?
    let region: Region?
    let manager: User?
    let salespeople: [Salesperson]?
    
    init(id: String, name: String, regionId: String, createdAt: String? = nil, updatedAt: String? = nil, region: Region? = nil, manager: User? = nil, salespeople: [Salesperson]? = nil) {
        self.id = id
        self.name = name
        self.regionId = regionId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.region = region
        self.manager = manager
        self.salespeople = salespeople
    }
}//
//  Team.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

