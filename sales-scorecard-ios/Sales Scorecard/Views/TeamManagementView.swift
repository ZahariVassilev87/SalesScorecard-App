import SwiftUI

struct TeamManagementView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var coreDataService = CoreDataService.shared
    @State private var teams: [Team] = []
    @State private var salespeople: [Salesperson] = []
    @State private var isLoading = true
    @State private var selectedTeam: Team?
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading team structure...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        
                        Text("Error")
                            .font(.headline)
                        
                        Text(errorMessage)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Button("Retry") {
                            loadTeamData()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Header
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Team Management")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text("Manage your team structure and members")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)
                            
                            // Teams List
                            ForEach(teams) { team in
                                TeamCard(team: team, salespeople: salespeople.filter { $0.teamId == team.id })
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Team Management")
        }
        .onAppear {
            loadTeamData()
        }
    }
    
    private func loadTeamData() {
        isLoading = true
        errorMessage = nil
        
        guard let token = authManager.authToken else {
            errorMessage = "No authentication token available"
            isLoading = false
            return
        }
        
        let apiService = APIService()
        
        // Load teams from API
        apiService.getTeams(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let teamsData):
                    self.teams = teamsData
                    // Extract salespeople from teams
                    self.salespeople = teamsData.flatMap { $0.salespeople ?? [] }
                case .failure(let error):
                    self.errorMessage = "Failed to load teams: \(error.localizedDescription)"
                    // Fallback to sample data if API fails
                    self.createSampleData()
                }
                self.isLoading = false
            }
        }
    }
    
    private func createSampleData() {
        let sampleTeams = [
            Team(id: "1", name: "Enterprise Sales", regionId: "1"),
            Team(id: "2", name: "SMB Sales", regionId: "1"),
            Team(id: "3", name: "Channel Sales", regionId: "2")
        ]
        
        let sampleSalespeople = [
            Salesperson(id: "1", firstName: "John", lastName: "Smith", email: "john@company.com", teamId: "1", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"),
            Salesperson(id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah@company.com", teamId: "1", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"),
            Salesperson(id: "3", firstName: "Mike", lastName: "Davis", email: "mike@company.com", teamId: "1", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"),
            Salesperson(id: "4", firstName: "Lisa", lastName: "Brown", email: "lisa@company.com", teamId: "2", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"),
            Salesperson(id: "5", firstName: "Tom", lastName: "Wilson", email: "tom@company.com", teamId: "2", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z"),
            Salesperson(id: "6", firstName: "Emma", lastName: "Garcia", email: "emma@company.com", teamId: "3", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z")
        ]
        
        // Save sample data to Core Data
        for team in sampleTeams {
            coreDataService.saveTeam(team)
        }
        
        for salesperson in sampleSalespeople {
            coreDataService.saveSalesperson(salesperson)
        }
        
        // Reload data
        self.teams = coreDataService.getAllTeams()
        self.salespeople = coreDataService.getAllSalespeople()
    }
}

struct TeamCard: View {
    let team: Team
    let salespeople: [Salesperson]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Team Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(team.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    if let region = team.region {
                        Text("Region: \(region.name)")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }
                    
                    Text("\(salespeople.count) members")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button("Manage") {
                    // Navigate to team management
                }
                .buttonStyle(DefaultButtonStyle())
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
            }
            
            // Regional Manager
            if let region = team.region, let managers = region.managers, !managers.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Regional Manager:")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    ForEach(managers.filter { $0.role == "REGIONAL_SALES_MANAGER" }) { manager in
                        HStack {
                            Circle()
                                .fill(Color.blue.opacity(0.2))
                                .frame(width: 24, height: 24)
                                .overlay(
                                    Text(manager.displayName.prefix(1))
                                        .font(.caption)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.blue)
                                )
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(manager.displayName)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                
                                Text(manager.email)
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                    }
                }
            }
            
            // Sales Lead
            if let manager = team.manager {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Sales Lead:")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        Circle()
                            .fill(Color.green.opacity(0.2))
                            .frame(width: 24, height: 24)
                            .overlay(
                                Text(manager.displayName.prefix(1))
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.green)
                            )
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(manager.displayName)
                                .font(.caption)
                                .fontWeight(.medium)
                            
                            Text(manager.email)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                }
            }
            
            // Team Members
            if salespeople.isEmpty {
                Text("No team members yet")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .italic()
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 8) {
                    ForEach(salespeople) { person in
                        TeamMemberCard(person: person)
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct TeamMemberCard: View {
    let person: Salesperson
    
    var body: some View {
        VStack(spacing: 4) {
            // Avatar
            Circle()
                .fill(Color.blue.opacity(0.2))
                .frame(width: 40, height: 40)
                .overlay(
                    Text("\(person.firstName.prefix(1))\(person.lastName.prefix(1))")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.blue)
                )
            
            // Name
            Text("\(person.firstName) \(person.lastName)")
                .font(.caption)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
            
            // Role
            Text("Salesperson")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color.white)
        .cornerRadius(8)
    }
}

#Preview {
    TeamManagementView()
}
