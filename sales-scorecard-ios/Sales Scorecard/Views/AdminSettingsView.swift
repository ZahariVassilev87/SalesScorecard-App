import SwiftUI

struct AdminSettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var regions: [Region] = []
    @State private var teams: [Team] = []
    @State private var users: [User] = []
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading admin data...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Header
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Admin Settings")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text("Manage organization structure and users")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)
                            
                            // Quick Stats
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 16) {
                                StatCard(title: "Regions", value: "\(regions.count)", icon: "globe", color: .blue)
                                StatCard(title: "Teams", value: "\(teams.count)", icon: "person.2", color: .green)
                                StatCard(title: "Users", value: "\(users.count)", icon: "person", color: .orange)
                            }
                            
                            // Organization Structure
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Organization Structure")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                ForEach(regions) { region in
                                    RegionCard(region: region, teams: teams.filter { $0.regionId == region.id })
                                }
                            }
                            
                            // Logout Button
                            Button(action: {
                                authManager.logout()
                            }) {
                                HStack {
                                    Image(systemName: "power")
                                    Text("Logout")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Admin")
        }
        .onAppear {
            loadAdminData()
        }
    }
    
    private func loadAdminData() {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            regions = [
                Region(id: "1", name: "North America"),
                Region(id: "2", name: "Europe"),
                Region(id: "3", name: "Asia Pacific")
            ]
            
            teams = [
                Team(id: "1", name: "Enterprise Sales", regionId: "1"),
                Team(id: "2", name: "SMB Sales", regionId: "1"),
                Team(id: "3", name: "Channel Sales", regionId: "2"),
                Team(id: "4", name: "Direct Sales", regionId: "3")
            ]
            
            users = [
                User(id: "1", email: "admin@company.com", displayName: "Admin User", role: "ADMIN", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z", managedRegions: nil),
                User(id: "2", email: "director@company.com", displayName: "Sales Director", role: "SALES_DIRECTOR", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z", managedRegions: nil),
                User(id: "3", email: "manager@company.com", displayName: "Sales Manager", role: "SALES_MANAGER", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z", managedRegions: nil)
            ]
            
            isLoading = false
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

struct RegionCard: View {
    let region: Region
    let teams: [Team]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(region.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text("\(teams.count) teams")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            ForEach(teams) { team in
                HStack {
                    Text("• \(team.name)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                .padding(.leading, 16)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}
