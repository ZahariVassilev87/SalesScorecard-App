import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var categories: [BehaviorCategory] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading categories...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundColor(.orange)
                        
                        Text("Error Loading Data")
                            .font(.headline)
                        
                        Text(errorMessage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Button("Retry") {
                            loadCategories()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            // Welcome Header
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Welcome back!")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text("Ready to evaluate sales performance?")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)
                            
                            // Categories Overview
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Scoring Categories")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                ForEach(categories) { category in
                                    CategoryCard(category: category)
                                }
                            }
                            
                            // Quick Actions
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Quick Actions")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                HStack(spacing: 12) {
                                    NavigationLink(destination: NewEvaluationView()) {
                                        ActionCard(
                                            title: "New Evaluation",
                                            subtitle: "Start a new assessment",
                                            icon: "plus.circle.fill",
                                            color: .green
                                        )
                                    }
                                    
                                    NavigationLink(destination: EvaluationsView()) {
                                        ActionCard(
                                            title: "View History",
                                            subtitle: "Past evaluations",
                                            icon: "clock.fill",
                                            color: .blue
                                        )
                                    }
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout") {
                        authManager.logout()
                    }
                }
            }
        }
        .onAppear {
            loadCategories()
        }
    }
    
    private func loadCategories() {
        isLoading = true
        errorMessage = nil
        
        APIService().getCategories { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let categories):
                    self.categories = categories
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct CategoryCard: View {
    let category: BehaviorCategory
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(category.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text("\(Int(category.weight * 100))%")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(8)
            }
            
            Text("\(category.items.count) behavior items")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct ActionCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)
            
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthManager())
}