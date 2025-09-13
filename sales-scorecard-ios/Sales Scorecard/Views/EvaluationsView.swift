import SwiftUI

struct EvaluationsView: View {
    @State private var evaluations: [Evaluation] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading evaluations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundColor(.orange)
                        
                        Text("Error Loading Evaluations")
                            .font(.headline)
                        
                        Text(errorMessage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Button("Retry") {
                            loadEvaluations()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else if evaluations.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "doc.text")
                            .font(.system(size: 40))
                            .foregroundColor(.secondary)
                        
                        Text("No Evaluations Yet")
                            .font(.headline)
                        
                        Text("Start by creating your first evaluation")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        NavigationLink(destination: NewEvaluationView()) {
                            Text("Create Evaluation")
                                .buttonStyle(.borderedProminent)
                        }
                    }
                    .padding()
                } else {
                    List(evaluations) { evaluation in
                        EvaluationRow(evaluation: evaluation)
                    }
                    .refreshable {
                        loadEvaluations()
                    }
                }
            }
            .navigationTitle("Evaluations")
        }
        .onAppear {
            loadEvaluations()
        }
    }
    
    private func loadEvaluations() {
        isLoading = true
        errorMessage = nil
        
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else {
            // Show empty state if no token
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                isLoading = false
                evaluations = []
            }
            return
        }
        
        let apiService = APIService()
        apiService.getEvaluations(token: token) { result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let evaluations):
                    self.evaluations = evaluations
                case .failure(let error):
                    print("Error loading evaluations: \(error)")
                    self.errorMessage = "Failed to load evaluations. Please try again."
                    self.evaluations = []
                }
            }
        }
    }
}

struct EvaluationRow: View {
    let evaluation: Evaluation
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let salesperson = evaluation.salesperson {
                        Text("\(salesperson.firstName) \(salesperson.lastName)")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                    
                    Text(evaluation.visitDate)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if let score = evaluation.overallScore {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(score, specifier: "%.1f")")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                        
                        Text("Overall")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            if let notes = evaluation.notes, !notes.isEmpty {
                Text(notes)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    EvaluationsView()
}
