import Foundation
import CoreData

class CoreDataService: ObservableObject {
    static let shared = CoreDataService()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "SalesScorecardModel")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \(error)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Save error: \(error)")
            }
        }
    }
    
    // MARK: - User Operations
    func saveUser(_ user: User) {
        let userEntity = UserEntity(context: context)
        userEntity.id = user.id
        userEntity.email = user.email
        userEntity.displayName = user.displayName
        userEntity.role = user.role
        userEntity.isActive = user.isActive
        userEntity.createdAt = ISO8601DateFormatter().date(from: user.createdAt) ?? Date()
        userEntity.updatedAt = ISO8601DateFormatter().date(from: user.updatedAt) ?? Date()
        save()
    }
    
    func getCurrentUser() -> User? {
        let request: NSFetchRequest<UserEntity> = UserEntity.fetchRequest()
        request.fetchLimit = 1
        
        do {
            let users = try context.fetch(request)
            if let userEntity = users.first {
                return User(
                    id: userEntity.id ?? "",
                    email: userEntity.email ?? "",
                    displayName: userEntity.displayName ?? "",
                    role: userEntity.role ?? "",
                    isActive: userEntity.isActive,
                    createdAt: ISO8601DateFormatter().string(from: userEntity.createdAt ?? Date()),
                    updatedAt: ISO8601DateFormatter().string(from: userEntity.updatedAt ?? Date())
                )
            }
        } catch {
            print("Fetch user error: \(error)")
        }
        return nil
    }
    
    // MARK: - Evaluation Operations
    func saveEvaluation(_ evaluation: Evaluation) {
        let evaluationEntity = EvaluationEntity(context: context)
        evaluationEntity.id = evaluation.id
        evaluationEntity.salespersonId = evaluation.salespersonId
        evaluationEntity.managerId = evaluation.managerId
        evaluationEntity.visitDate = ISO8601DateFormatter().date(from: evaluation.visitDate) ?? Date()
        evaluationEntity.location = evaluation.location
        evaluationEntity.overallScore = evaluation.overallScore ?? 0
        evaluationEntity.notes = evaluation.notes
        evaluationEntity.createdAt = ISO8601DateFormatter().date(from: evaluation.createdAt) ?? Date()
        evaluationEntity.updatedAt = ISO8601DateFormatter().date(from: evaluation.updatedAt) ?? Date()
        save()
    }
    
    func getAllEvaluations() -> [Evaluation] {
        let request: NSFetchRequest<EvaluationEntity> = EvaluationEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        
        do {
            let evaluationEntities = try context.fetch(request)
            return evaluationEntities.compactMap { entity in
                Evaluation(
                    id: entity.id ?? "",
                    salespersonId: entity.salespersonId ?? "",
                    managerId: entity.managerId ?? "",
                    visitDate: ISO8601DateFormatter().string(from: entity.visitDate ?? Date()),
                    location: entity.location,
                    overallScore: entity.overallScore,
                    notes: entity.notes,
                    createdAt: ISO8601DateFormatter().string(from: entity.createdAt ?? Date()),
                    updatedAt: ISO8601DateFormatter().string(from: entity.updatedAt ?? Date()),
                    salesperson: nil
                )
            }
        } catch {
            print("Fetch evaluations error: \(error)")
            return []
        }
    }
    
    // MARK: - Team Operations
    func saveTeam(_ team: Team) {
        let teamEntity = TeamEntity(context: context)
        teamEntity.id = team.id
        teamEntity.name = team.name
        teamEntity.regionId = team.regionId
        teamEntity.createdAt = ISO8601DateFormatter().date(from: team.createdAt ?? "") ?? Date()
        teamEntity.updatedAt = ISO8601DateFormatter().date(from: team.updatedAt ?? "") ?? Date()
        save()
    }
    
    func getAllTeams() -> [Team] {
        let request: NSFetchRequest<TeamEntity> = TeamEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "name", ascending: true)]
        
        do {
            let teamEntities = try context.fetch(request)
            return teamEntities.compactMap { entity in
                Team(
                    id: entity.id ?? "",
                    name: entity.name ?? "",
                    regionId: entity.regionId ?? "",
                    createdAt: ISO8601DateFormatter().string(from: entity.createdAt ?? Date()),
                    updatedAt: ISO8601DateFormatter().string(from: entity.updatedAt ?? Date())
                )
            }
        } catch {
            print("Fetch teams error: \(error)")
            return []
        }
    }
    
    // MARK: - Region Operations
    func saveRegion(_ region: Region) {
        let regionEntity = RegionEntity(context: context)
        regionEntity.id = region.id
        regionEntity.name = region.name
        regionEntity.createdAt = ISO8601DateFormatter().date(from: region.createdAt ?? "") ?? Date()
        regionEntity.updatedAt = ISO8601DateFormatter().date(from: region.updatedAt ?? "") ?? Date()
        save()
    }
    
    func getAllRegions() -> [Region] {
        let request: NSFetchRequest<RegionEntity> = RegionEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "name", ascending: true)]
        
        do {
            let regionEntities = try context.fetch(request)
            return regionEntities.compactMap { entity in
                Region(
                    id: entity.id ?? "",
                    name: entity.name ?? "",
                    createdAt: ISO8601DateFormatter().string(from: entity.createdAt ?? Date()),
                    updatedAt: ISO8601DateFormatter().string(from: entity.updatedAt ?? Date())
                )
            }
        } catch {
            print("Fetch regions error: \(error)")
            return []
        }
    }
    
    // MARK: - Salesperson Operations
    func saveSalesperson(_ salesperson: Salesperson) {
        let salespersonEntity = SalespersonEntity(context: context)
        salespersonEntity.id = salesperson.id
        salespersonEntity.firstName = salesperson.firstName
        salespersonEntity.lastName = salesperson.lastName
        salespersonEntity.email = salesperson.email
        salespersonEntity.teamId = salesperson.teamId
        salespersonEntity.isActive = salesperson.isActive
        salespersonEntity.createdAt = ISO8601DateFormatter().date(from: salesperson.createdAt ?? "") ?? Date()
        salespersonEntity.updatedAt = ISO8601DateFormatter().date(from: salesperson.updatedAt ?? "") ?? Date()
        save()
    }
    
    func getAllSalespeople() -> [Salesperson] {
        let request: NSFetchRequest<SalespersonEntity> = SalespersonEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "firstName", ascending: true)]
        
        do {
            let salespersonEntities = try context.fetch(request)
            return salespersonEntities.compactMap { entity in
                Salesperson(
                    id: entity.id ?? "",
                    firstName: entity.firstName ?? "",
                    lastName: entity.lastName ?? "",
                    email: entity.email ?? "",
                    teamId: entity.teamId ?? "",
                    isActive: entity.isActive,
                    createdAt: ISO8601DateFormatter().string(from: entity.createdAt ?? Date()),
                    updatedAt: ISO8601DateFormatter().string(from: entity.updatedAt ?? Date())
                )
            }
        } catch {
            print("Fetch salespeople error: \(error)")
            return []
        }
    }
}//
//  CoreDataService.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

