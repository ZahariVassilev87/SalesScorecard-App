import SwiftUI

struct EvaluationsHistoryView: View {
    @StateObject private var coreDataService = CoreDataService.shared
    @State private var evaluations: [Evaluation] = []
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading evaluations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if evaluations.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "clock")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        
                        Text("No Evaluations Yet")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Start by creating your first evaluation")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(evaluations) { evaluation in
                        EvaluationHistoryRow(evaluation: evaluation)
                    }
                    .refreshable {
                        loadEvaluations()
                    }
                }
            }
            .navigationTitle("Evaluation History")
            .onAppear {
                loadEvaluations()
            }
        }
    }
    
    private func loadEvaluations() {
        evaluations = coreDataService.getAllEvaluations()
        isLoading = false
    }
}

struct EvaluationHistoryRow: View {
    let evaluation: Evaluation
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(evaluation.salesperson?.firstName ?? "") \(evaluation.salesperson?.lastName ?? "")")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(evaluation.salesperson?.email ?? "")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    if let score = evaluation.overallScore {
                        Text(String(format: "%.1f", score))
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }
                    
                    Text("Score")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Visit Date")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(formatDate(evaluation.visitDate))
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                if let location = evaluation.location {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("Location")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text(location)
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                }
            }
            
            if let notes = evaluation.notes, !notes.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Notes")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(notes)
                        .font(.subheadline)
                        .lineLimit(2)
                }
            }
        }
        .padding(.vertical, 8)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        
        if let date = ISO8601DateFormatter().date(from: dateString) {
            return formatter.string(from: date)
        }
        return dateString
    }
}

#Preview {
    EvaluationsHistoryView()
}
