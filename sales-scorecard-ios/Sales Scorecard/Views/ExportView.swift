import SwiftUI
import UniformTypeIdentifiers

struct ExportView: View {
    @State private var isLoading = false
    @State private var showingShareSheet = false
    @State private var exportedData: Data?
    @State private var exportedFileName = ""
    @State private var selectedExportOption: ExportOption?
    @State private var showingFilters = false
    @State private var exportFilters = ExportFilters()
    
    private let exportOptions: [ExportOption] = [
        ExportOption(
            title: "All Evaluations",
            description: "Export all evaluations with detailed scoring and comments",
            format: .csv,
            filters: ["Date Range", "Team", "Region", "Salesperson"]
        ),
        ExportOption(
            title: "Team Performance",
            description: "Export team performance metrics and rankings",
            format: .csv,
            filters: ["Region", "Team"]
        ),
        ExportOption(
            title: "Salesperson Performance",
            description: "Export individual salesperson performance data",
            format: .csv,
            filters: ["Team", "Region", "Limit"]
        ),
        ExportOption(
            title: "Dashboard Analytics",
            description: "Export key metrics and statistics",
            format: .csv
        ),
        ExportOption(
            title: "Trends Data",
            description: "Export performance trends over time",
            format: .csv
        ),
        ExportOption(
            title: "Category Performance",
            description: "Export category-wise performance breakdown",
            format: .csv
        )
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Export Data")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Generate reports and export data for analysis")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    
                    // Export Options
                    LazyVStack(spacing: 16) {
                        ForEach(exportOptions.indices, id: \.self) { index in
                            ExportOptionCard(
                                option: exportOptions[index],
                                isLoading: isLoading && selectedExportOption?.title == exportOptions[index].title,
                                onExport: { option in
                                    selectedExportOption = option
                                    performExport(option)
                                },
                                onShowFilters: { option in
                                    selectedExportOption = option
                                    showingFilters = true
                                }
                            )
                        }
                    }
                    
                    if isLoading {
                        ProgressView("Generating export...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .padding()
                    }
                }
                .padding()
            }
            .navigationTitle("Export")
            .sheet(isPresented: $showingShareSheet) {
                if let data = exportedData {
                    ShareSheet(data: data, fileName: exportedFileName)
                }
            }
            .sheet(isPresented: $showingFilters) {
                if let option = selectedExportOption {
                    ExportFiltersView(
                        option: option,
                        filters: $exportFilters,
                        onApply: { filters in
                            exportFilters = filters
                            showingFilters = false
                            performExport(option)
                        },
                        onCancel: {
                            showingFilters = false
                        }
                    )
                }
            }
        }
    }
    
    private func performExport(_ option: ExportOption) {
        guard let token = KeychainService().getToken() else {
            // Handle no token error
            return
        }
        
        isLoading = true
        
        let apiService = APIService()
        
        switch option.title {
        case "All Evaluations":
            apiService.exportEvaluationsCSV(token: token, filters: exportFilters) { result in
                handleExportResult(result, fileName: "evaluations.csv")
            }
            
        case "Team Performance":
            apiService.exportTeamPerformanceCSV(
                token: token,
                regionId: exportFilters.regionId,
                teamId: exportFilters.teamId
            ) { result in
                handleExportResult(result, fileName: "team-performance.csv")
            }
            
        case "Salesperson Performance":
            apiService.exportSalespersonPerformanceCSV(
                token: token,
                teamId: exportFilters.teamId,
                regionId: exportFilters.regionId
            ) { result in
                handleExportResult(result, fileName: "salesperson-performance.csv")
            }
            
        case "Dashboard Analytics":
            apiService.exportAnalyticsCSV(token: token, type: .dashboard) { result in
                handleExportResult(result, fileName: "dashboard-analytics.csv")
            }
            
        case "Trends Data":
            apiService.exportAnalyticsCSV(token: token, type: .trends) { result in
                handleExportResult(result, fileName: "trends-analytics.csv")
            }
            
        case "Category Performance":
            apiService.exportAnalyticsCSV(token: token, type: .categories) { result in
                handleExportResult(result, fileName: "category-analytics.csv")
            }
            
        default:
            isLoading = false
        }
    }
    
    private func handleExportResult(_ result: Result<Data, Error>, fileName: String) {
        DispatchQueue.main.async {
            self.isLoading = false
            
            switch result {
            case .success(let data):
                self.exportedData = data
                self.exportedFileName = fileName
                self.showingShareSheet = true
                
            case .failure(let error):
                print("Export failed: \(error)")
                // Handle error - could show an alert
            }
        }
    }
}

struct ExportOptionCard: View {
    let option: ExportOption
    let isLoading: Bool
    let onExport: (ExportOption) -> Void
    let onShowFilters: (ExportOption) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(option.title)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(option.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
                
                VStack {
                    Text(option.format.displayName)
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(option.format == .csv ? Color.green : Color.blue)
                        .cornerRadius(8)
                    
                    if isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                }
            }
            
            if !option.filters.isEmpty {
                HStack {
                    Image(systemName: "slider.horizontal.3")
                        .foregroundColor(.blue)
                    Text("Filters: \(option.filters.joined(separator: ", "))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack(spacing: 12) {
                Button(action: {
                    onExport(option)
                }) {
                    HStack {
                        Image(systemName: "square.and.arrow.down")
                        Text("Export")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .disabled(isLoading)
                
                if !option.filters.isEmpty {
                    Button(action: {
                        onShowFilters(option)
                    }) {
                        HStack {
                            Image(systemName: "slider.horizontal.3")
                            Text("Filters")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(8)
                    }
                    .disabled(isLoading)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .gray.opacity(0.2), radius: 2, x: 0, y: 1)
    }
}

struct ExportFiltersView: View {
    let option: ExportOption
    @Binding var filters: ExportFilters
    let onApply: (ExportFilters) -> Void
    let onCancel: () -> Void
    
    @State private var startDate = ""
    @State private var endDate = ""
    @State private var selectedTeamId: String?
    @State private var selectedRegionId: String?
    @State private var selectedSalespersonId: String?
    @State private var limit: String = "50"
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Date Range")) {
                    if option.filters.contains("Date Range") {
                        HStack {
                            Text("Start Date")
                            Spacer()
                            TextField("YYYY-MM-DD", text: $startDate)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numbersAndPunctuation)
                        }
                        
                        HStack {
                            Text("End Date")
                            Spacer()
                            TextField("YYYY-MM-DD", text: $endDate)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numbersAndPunctuation)
                        }
                    }
                }
                
                Section(header: Text("Organization")) {
                    if option.filters.contains("Region") {
                        HStack {
                            Text("Region")
                            Spacer()
                            Text("All Regions")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if option.filters.contains("Team") {
                        HStack {
                            Text("Team")
                            Spacer()
                            Text("All Teams")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if option.filters.contains("Salesperson") {
                        HStack {
                            Text("Salesperson")
                            Spacer()
                            Text("All Salespeople")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section(header: Text("Options")) {
                    if option.filters.contains("Limit") {
                        HStack {
                            Text("Limit Results")
                            Spacer()
                            TextField("50", text: $limit)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numberPad)
                                .frame(width: 80)
                        }
                    }
                }
            }
            .navigationTitle("Export Filters")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Apply") {
                        let newFilters = ExportFilters(
                            startDate: startDate.isEmpty ? nil : startDate,
                            endDate: endDate.isEmpty ? nil : endDate,
                            teamId: selectedTeamId,
                            regionId: selectedRegionId,
                            salespersonId: selectedSalespersonId
                        )
                        onApply(newFilters)
                    }
                }
            }
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let data: Data
    let fileName: String
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        // Create a temporary file
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        
        do {
            try data.write(to: tempURL)
        } catch {
            print("Error writing file: \(error)")
        }
        
        let activityViewController = UIActivityViewController(
            activityItems: [tempURL],
            applicationActivities: nil
        )
        
        return activityViewController
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {
        // No updates needed
    }
}

#Preview {
    ExportView()
}