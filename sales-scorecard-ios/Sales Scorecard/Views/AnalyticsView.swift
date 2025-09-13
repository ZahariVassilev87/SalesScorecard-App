import SwiftUI
import Charts

struct AnalyticsView: View {
    @State private var analyticsData: AnalyticsData = AnalyticsData()
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Performance Analytics")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Track trends and identify improvement areas")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    
                    // Summary Cards
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        SummaryCard(
                            title: "Total Evaluations",
                            value: "\(analyticsData.totalEvaluations)",
                            icon: "doc.text",
                            color: .blue
                        )
                        
                        SummaryCard(
                            title: "Average Score",
                            value: String(format: "%.1f", analyticsData.averageScore),
                            icon: "star",
                            color: .green
                        )
                        
                        SummaryCard(
                            title: "Salespeople",
                            value: "\(analyticsData.totalSalespeople)",
                            icon: "person.2",
                            color: .orange
                        )
                        
                        SummaryCard(
                            title: "This Month",
                            value: "\(analyticsData.thisMonthEvaluations)",
                            icon: "calendar",
                            color: .purple
                        )
                    }
                    
                    // Category Performance Chart
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Category Performance")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Chart(analyticsData.categoryScores, id: \.name) { category in
                            BarMark(
                                x: .value("Score", category.score),
                                y: .value("Category", category.name)
                            )
                            .foregroundStyle(.blue)
                        }
                        .frame(height: 200)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Trend Chart
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Performance Trend")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Chart(analyticsData.trendData, id: \.date) { point in
                            LineMark(
                                x: .value("Date", point.date),
                                y: .value("Score", point.score)
                            )
                            .foregroundStyle(.green)
                            .interpolationMethod(.catmullRom)
                        }
                        .frame(height: 200)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
            .navigationTitle("Analytics")
        }
        .onAppear {
            loadAnalytics()
        }
    }
    
    private func loadAnalytics() {
        isLoading = true
        
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else {
            // Fallback to mock data if no token
            loadMockAnalytics()
            return
        }
        
        let apiService = APIService()
        apiService.getAnalytics(token: token) { result in
            DispatchQueue.main.async {
                self.isLoading = false
                
                switch result {
                case .success(let analytics):
                    self.analyticsData = analytics
                case .failure(let error):
                    print("Error loading analytics: \(error)")
                    // Fallback to mock data
                    self.loadMockAnalytics()
                }
            }
        }
    }
    
    private func loadMockAnalytics() {
        analyticsData = AnalyticsData(
            totalEvaluations: 24,
            averageScore: 4.1,
            totalSalespeople: 8,
            thisMonthEvaluations: 12,
            categoryScores: [
                CategoryScore(name: "Discovery", score: 4.2),
                CategoryScore(name: "Solution Positioning", score: 3.9),
                CategoryScore(name: "Closing & Next Steps", score: 4.0),
                CategoryScore(name: "Professionalism", score: 4.3)
            ],
            trendData: [
                TrendPoint(date: "Jan 1", score: 3.8),
                TrendPoint(date: "Jan 8", score: 4.0),
                TrendPoint(date: "Jan 15", score: 4.1),
                TrendPoint(date: "Jan 22", score: 4.2),
                TrendPoint(date: "Jan 29", score: 4.1)
            ]
        )
        isLoading = false
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

// Data Models
struct AnalyticsData: Codable {
    let totalEvaluations: Int
    let averageScore: Double
    let totalSalespeople: Int
    let thisMonthEvaluations: Int
    let categoryScores: [CategoryScore]
    let trendData: [TrendPoint]
    
    init(
        totalEvaluations: Int = 0,
        averageScore: Double = 0.0,
        totalSalespeople: Int = 0,
        thisMonthEvaluations: Int = 0,
        categoryScores: [CategoryScore] = [],
        trendData: [TrendPoint] = []
    ) {
        self.totalEvaluations = totalEvaluations
        self.averageScore = averageScore
        self.totalSalespeople = totalSalespeople
        self.thisMonthEvaluations = thisMonthEvaluations
        self.categoryScores = categoryScores
        self.trendData = trendData
    }
}

struct CategoryScore: Codable {
    let name: String
    let score: Double
}

struct TrendPoint: Codable {
    let date: String
    let score: Double
}
