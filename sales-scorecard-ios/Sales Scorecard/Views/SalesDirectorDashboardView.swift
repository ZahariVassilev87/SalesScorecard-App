import SwiftUI

struct SalesDirectorDashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var teams: [Team] = []
    @State private var regions: [Region] = []
    @State private var salesDirectors: [User] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Sales Director Dashboard")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        if let user = authManager.currentUser {
                            Text("Welcome, \(user.displayName)")
                                .font(.title2)
                                .foregroundColor(.secondary)
                            
                            Text("Managing all regions across the organization")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.horizontal)
                    
                    if isLoading {
                        ProgressView("Loading dashboard...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if let errorMessage = errorMessage {
                        ErrorView(message: errorMessage) {
                            loadDashboardData()
                        }
                    } else {
                        // Dashboard Content
                        VStack(spacing: 20) {
                            // Overview Cards
                            OverviewCardsView(teams: teams, regions: regions, salesDirectors: salesDirectors)
                            
                            // Regional Overview
                            RegionalOverviewView(regions: regions)
                            
                            // Team Performance Summary
                            TeamPerformanceView(teams: teams)
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            loadDashboardData()
        }
    }
    
    private func loadDashboardData() {
        guard let token = authManager.authToken else { return }
        
        isLoading = true
        errorMessage = nil
        
        let apiService = APIService()
        
        // Load teams
        apiService.getTeams(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let teamsData):
                    self.teams = teamsData
                case .failure(let error):
                    self.errorMessage = "Failed to load teams: \(error.localizedDescription)"
                }
            }
        }
        
        // Load regions
        apiService.getRegions(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let regionsData):
                    self.regions = regionsData
                case .failure(let error):
                    self.errorMessage = "Failed to load regions: \(error.localizedDescription)"
                }
            }
        }
        
        // Load sales directors
        apiService.getSalesDirectors(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let directorsData):
                    self.salesDirectors = directorsData
                case .failure(let error):
                    self.errorMessage = "Failed to load sales directors: \(error.localizedDescription)"
                }
                
                self.isLoading = false
            }
        }
    }
}

// MARK: - Overview Cards
struct OverviewCardsView: View {
    let teams: [Team]
    let regions: [Region]
    let salesDirectors: [User]
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            OverviewCard(
                title: "Total Regions",
                value: "\(regions.count)",
                icon: "globe",
                color: .blue
            )
            
            OverviewCard(
                title: "Total Teams",
                value: "\(teams.count)",
                icon: "person.2",
                color: .green
            )
            
            OverviewCard(
                title: "Sales Directors",
                value: "\(salesDirectors.count)",
                icon: "person.badge.plus",
                color: .purple
            )
            
            OverviewCard(
                title: "Total Salespeople",
                value: "\(teams.compactMap { $0.salespeople?.count }.reduce(0, +))",
                icon: "person.3",
                color: .orange
            )
        }
    }
}

struct OverviewCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Regional Overview
struct RegionalOverviewView: View {
    let regions: [Region]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Regional Overview")
                .font(.title2)
                .fontWeight(.semibold)
            
            ForEach(regions) { region in
                RegionalCard(region: region)
            }
        }
    }
}

struct RegionalCard: View {
    let region: Region
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(region.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Image(systemName: "location")
                    .foregroundColor(.blue)
            }
            
            if let managers = region.managers, !managers.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Management:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    ForEach(managers) { manager in
                        HStack {
                            Circle()
                                .fill(manager.isSalesDirector ? Color.purple : Color.blue)
                                .frame(width: 8, height: 8)
                            
                            Text(manager.displayName)
                                .font(.caption)
                            
                            Text("(\(manager.role.replacingOccurrences(of: "_", with: " ")))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Team Performance
struct TeamPerformanceView: View {
    let teams: [Team]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Team Performance")
                .font(.title2)
                .fontWeight(.semibold)
            
            ForEach(teams) { team in
                TeamCard(team: team)
            }
        }
    }
}

struct TeamCard: View {
    let team: Team
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(team.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                if let region = team.region {
                    Text(region.name)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.2))
                        .foregroundColor(.blue)
                        .cornerRadius(8)
                }
            }
            
            if let manager = team.manager {
                HStack {
                    Text("Manager:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(manager.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
            
            if let salespeople = team.salespeople {
                HStack {
                    Text("Salespeople:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(salespeople.count)")
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Error View
struct ErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.orange)
            
            Text("Error")
                .font(.headline)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Retry") {
                onRetry()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    SalesDirectorDashboardView()
        .environmentObject(AuthManager())
}
