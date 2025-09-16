import SwiftUI

struct AnalyticsView: View {
    @State private var selectedTab = 0
    @State private var analyticsData: AnalyticsData = AnalyticsData()
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Analytics View", selection: $selectedTab) {
                    Text("Overview").tag(0)
                    Text("Performance").tag(1)
                    Text("Teams").tag(2)
                    Text("Insights").tag(3)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Content based on selected tab
                TabView(selection: $selectedTab) {
                    OverviewTabView(analyticsData: analyticsData, isLoading: isLoading)
                        .tag(0)
                    
                    PerformanceTabView(isLoading: isLoading)
                        .tag(1)
                    
                    TeamsTabView(isLoading: isLoading)
                        .tag(2)
                    
                    InsightsTabView(isLoading: isLoading)
                        .tag(3)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
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
            totalTeams: 3,
            totalRegions: 2,
            thisMonthEvaluations: 12
        )
        isLoading = false
    }
}

// MARK: - Tab Views

struct OverviewTabView: View {
    let analyticsData: AnalyticsData
    let isLoading: Bool
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Performance Overview")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("Key metrics and trends at a glance")
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
                    
                    SummaryCard(
                        title: "Teams",
                        value: "\(analyticsData.totalTeams)",
                        icon: "person.3",
                        color: .red
                    )
                    
                    SummaryCard(
                        title: "Regions",
                        value: "\(analyticsData.totalRegions)",
                        icon: "globe",
                        color: .blue
                    )
                }
                
                if isLoading {
                    ProgressView("Loading analytics...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .padding()
        }
    }
}

struct PerformanceTabView: View {
    @State private var trendsData: TrendsData?
    @State private var categoryPerformance: [CategoryPerformance] = []
    @State private var selectedTimeRange = 30
    let isLoading: Bool
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Time Range Selector
                VStack(alignment: .leading, spacing: 12) {
                    Text("Performance Trends")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Picker("Time Range", selection: $selectedTimeRange) {
                        Text("7 Days").tag(7)
                        Text("30 Days").tag(30)
                        Text("90 Days").tag(90)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                // Trends Chart
                if let trends = trendsData {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Performance Over Time")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        // Simple list view for iOS 14 compatibility
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(trends.data.prefix(5), id: \.date) { point in
                                HStack {
                                    Text(point.date)
                                        .font(.caption)
                                    Spacer()
                                    Text("\(point.score, specifier: "%.1f")")
                                        .font(.caption)
                                        .foregroundColor(.green)
                                }
                            }
                        }
                        .frame(height: 200)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
                
                // Category Performance Chart
                if !categoryPerformance.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Category Performance")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        // Simple list view for iOS 14 compatibility
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(categoryPerformance, id: \.name) { category in
                                HStack {
                                    Text(category.name)
                                        .font(.caption)
                                    Spacer()
                                    Text("\(category.averageScore, specifier: "%.1f")")
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .frame(height: 200)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
                
                if isLoading {
                    ProgressView("Loading performance data...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .padding()
        }
        .onAppear {
            loadPerformanceData()
        }
        .onChange(of: selectedTimeRange) { _ in
            loadPerformanceData()
        }
    }
    
    private func loadPerformanceData() {
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else { return }
        
        let apiService = APIService()
        
        // Load trends
        apiService.getTrends(token: token, days: selectedTimeRange) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let trends):
                    self.trendsData = trends
                case .failure(let error):
                    print("Error loading trends: \(error)")
                }
            }
        }
        
        // Load category performance
        apiService.getCategoryPerformance(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let categories):
                    self.categoryPerformance = categories
                case .failure(let error):
                    print("Error loading category performance: \(error)")
                }
            }
        }
    }
}

struct TeamsTabView: View {
    @State private var teamPerformance: [TeamPerformance] = []
    @State private var regionPerformance: [RegionPerformance] = []
    @State private var salespersonPerformance: [SalespersonPerformance] = []
    @State private var selectedView = 0
    let isLoading: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // View Selector
            Picker("Team View", selection: $selectedView) {
                Text("Teams").tag(0)
                Text("Regions").tag(1)
                Text("Top Performers").tag(2)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding()
            
            ScrollView {
                VStack(spacing: 16) {
                    if selectedView == 0 {
                        TeamListView(teams: teamPerformance)
                    } else if selectedView == 1 {
                        RegionListView(regions: regionPerformance)
                    } else {
                        SalespersonListView(salespeople: salespersonPerformance)
                    }
                    
                    if isLoading {
                        ProgressView("Loading team data...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .padding()
            }
        }
        .onAppear {
            loadTeamData()
        }
    }
    
    private func loadTeamData() {
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else { return }
        
        let apiService = APIService()
        
        // Load team performance
        apiService.getTeamPerformance(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let teams):
                    self.teamPerformance = teams
                case .failure(let error):
                    print("Error loading team performance: \(error)")
                }
            }
        }
        
        // Load region performance
        apiService.getRegionPerformance(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let regions):
                    self.regionPerformance = regions
                case .failure(let error):
                    print("Error loading region performance: \(error)")
                }
            }
        }
        
        // Load salesperson performance
        apiService.getSalespersonPerformance(token: token, limit: 10) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let salespeople):
                    self.salespersonPerformance = salespeople
                case .failure(let error):
                    print("Error loading salesperson performance: \(error)")
                }
            }
        }
    }
}

struct InsightsTabView: View {
    @State private var insights: [PerformanceInsight] = []
    let isLoading: Bool
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Performance Insights")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("AI-powered recommendations and analysis")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.purple.opacity(0.1))
                .cornerRadius(12)
                
                // Insights List
                LazyVStack(spacing: 16) {
                    ForEach(insights, id: \.type) { insight in
                        InsightCard(insight: insight)
                    }
                }
                
                if isLoading {
                    ProgressView("Loading insights...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .padding()
        }
        .onAppear {
            loadInsights()
        }
    }
    
    private func loadInsights() {
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else { return }
        
        let apiService = APIService()
        apiService.getPerformanceInsights(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let insights):
                    self.insights = insights
                case .failure(let error):
                    print("Error loading insights: \(error)")
                }
            }
        }
    }
}

// MARK: - Supporting Views

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

struct TeamListView: View {
    let teams: [TeamPerformance]
    
    var body: some View {
        LazyVStack(spacing: 12) {
            ForEach(teams, id: \.id) { team in
                TeamPerformanceCard(team: team)
            }
        }
    }
}

struct RegionListView: View {
    let regions: [RegionPerformance]
    
    var body: some View {
        LazyVStack(spacing: 12) {
            ForEach(regions, id: \.id) { region in
                RegionPerformanceCard(region: region)
            }
        }
    }
}

struct SalespersonListView: View {
    let salespeople: [SalespersonPerformance]
    
    var body: some View {
        LazyVStack(spacing: 12) {
            ForEach(salespeople, id: \.id) { salesperson in
                SalespersonPerformanceCard(salesperson: salesperson)
            }
        }
    }
}

struct TeamPerformanceCard: View {
    let team: TeamPerformance
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(team.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(team.regionName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text("\(team.salespersonCount) people • \(team.totalEvaluations) evaluations")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", team.averageScore))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.green)
                
                Text("Avg Score")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

struct RegionPerformanceCard: View {
    let region: RegionPerformance
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(region.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text("\(region.teamCount) teams • \(region.salespersonCount) people")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text("\(region.totalEvaluations) evaluations")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", region.averageScore))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text("Avg Score")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

struct SalespersonPerformanceCard: View {
    let salesperson: SalespersonPerformance
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(salesperson.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(salesperson.teamName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text("\(salesperson.totalEvaluations) evaluations")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", salesperson.averageScore))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                Text("Avg Score")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

struct InsightCard: View {
    let insight: PerformanceInsight
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(insight.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(insight.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text(String(format: "%.1f", insight.value))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(insightColor(for: insight.type))
                
                Text("Score")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(insightBackgroundColor(for: insight.type))
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
    
    private func insightColor(for type: String) -> Color {
        switch type {
        case "top_category", "top_team":
            return .green
        case "improvement_area":
            return .orange
        case "overall_performance":
            return .blue
        default:
            return .primary
        }
    }
    
    private func insightBackgroundColor(for type: String) -> Color {
        switch type {
        case "top_category", "top_team":
            return Color.green.opacity(0.1)
        case "improvement_area":
            return Color.orange.opacity(0.1)
        case "overall_performance":
            return Color.blue.opacity(0.1)
        default:
            return Color.white
        }
    }
}

// Data Models
struct AnalyticsData: Codable {
    let totalEvaluations: Int
    let averageScore: Double
    let totalSalespeople: Int
    let totalTeams: Int
    let totalRegions: Int
    let thisMonthEvaluations: Int
    
    init(
        totalEvaluations: Int = 0,
        averageScore: Double = 0.0,
        totalSalespeople: Int = 0,
        totalTeams: Int = 0,
        totalRegions: Int = 0,
        thisMonthEvaluations: Int = 0
    ) {
        self.totalEvaluations = totalEvaluations
        self.averageScore = averageScore
        self.totalSalespeople = totalSalespeople
        self.totalTeams = totalTeams
        self.totalRegions = totalRegions
        self.thisMonthEvaluations = thisMonthEvaluations
    }
}

struct TrendsData: Codable {
    let period: String
    let data: [TrendPoint]
}

struct TrendPoint: Codable {
    let date: String
    let score: Double
}

struct CategoryPerformance: Codable {
    let name: String
    let totalRatings: Int
    let sumRatings: Int
    let averageScore: Double
}

struct TeamPerformance: Codable {
    let id: String
    let name: String
    let regionName: String
    let salespersonCount: Int
    let totalEvaluations: Int
    let averageScore: Double
}

struct RegionPerformance: Codable {
    let id: String
    let name: String
    let teamCount: Int
    let salespersonCount: Int
    let totalEvaluations: Int
    let averageScore: Double
}

struct SalespersonPerformance: Codable {
    let id: String
    let name: String
    let email: String?
    let teamName: String
    let regionName: String
    let totalEvaluations: Int
    let averageScore: Double
    let latestScore: Double?
    let latestEvaluationDate: String?
}

struct PerformanceInsight: Codable {
    let type: String
    let title: String
    let description: String
    let value: Double
}

// Legacy models for backward compatibility
struct CategoryScore: Codable {
    let name: String
    let score: Double
}

// MARK: - Export Models

struct ExportFilters {
    var startDate: String?
    var endDate: String?
    var teamId: String?
    var regionId: String?
    var salespersonId: String?
    
    init(startDate: String? = nil, endDate: String? = nil, teamId: String? = nil, regionId: String? = nil, salespersonId: String? = nil) {
        self.startDate = startDate
        self.endDate = endDate
        self.teamId = teamId
        self.regionId = regionId
        self.salespersonId = salespersonId
    }
}

enum AnalyticsExportType: String, CaseIterable {
    case dashboard = "dashboard"
    case trends = "trends"
    case categories = "categories"
    
    var displayName: String {
        switch self {
        case .dashboard:
            return "Dashboard Analytics"
        case .trends:
            return "Trends Data"
        case .categories:
            return "Category Performance"
        }
    }
}

enum ExportFormat: String, CaseIterable {
    case csv = "csv"
    case pdf = "pdf"
    
    var displayName: String {
        switch self {
        case .csv:
            return "CSV Spreadsheet"
        case .pdf:
            return "PDF Report"
        }
    }
    
    var fileExtension: String {
        return rawValue
    }
}

struct ExportOption {
    let title: String
    let description: String
    let format: ExportFormat
    let filters: [String]
    
    init(title: String, description: String, format: ExportFormat, filters: [String] = []) {
        self.title = title
        self.description = description
        self.format = format
        self.filters = filters
    }
}
