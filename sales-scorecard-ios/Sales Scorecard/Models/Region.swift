import Foundation

struct Region: Identifiable, Codable {
    let id: String
    let name: String
    let createdAt: String?
    let updatedAt: String?
    
    init(id: String, name: String, createdAt: String? = nil, updatedAt: String? = nil) {
        self.id = id
        self.name = name
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}//
//  Region.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

