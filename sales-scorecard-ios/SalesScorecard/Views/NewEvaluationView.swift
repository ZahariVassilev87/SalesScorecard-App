import SwiftUI

struct NewEvaluationView: View {
    @State private var categories: [BehaviorCategory] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading evaluation form...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundColor(.orange)
                        
                        Text("Error Loading Form")
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
                        LazyVStack(spacing: 20) {
                            // Header
                            VStack(alignment: .leading, spacing: 8) {
                                Text("New Evaluation")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text("Rate each behavior on a scale of 1-5")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)
                            
                            // Categories
                            ForEach(categories) { category in
                                CategoryEvaluationSection(category: category)
                            }
                            
                            // Submit Button
                            Button("Submit Evaluation") {
                                // TODO: Implement submission
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.large)
                            .padding(.top)
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("New Evaluation")
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

struct CategoryEvaluationSection: View {
    let category: BehaviorCategory
    @State private var ratings: [String: Int] = [:]
    @State private var comments: [String: String] = [:]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Category Header
            HStack {
                Text(category.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text("Weight: \(Int(category.weight * 100))%")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(8)
            }
            
            // Behavior Items
            ForEach(category.items) { item in
                BehaviorItemRow(
                    item: item,
                    rating: Binding(
                        get: { ratings[item.id] ?? 0 },
                        set: { ratings[item.id] = $0 }
                    ),
                    comment: Binding(
                        get: { comments[item.id] ?? "" },
                        set: { comments[item.id] = $0 }
                    )
                )
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct BehaviorItemRow: View {
    let item: BehaviorItem
    @Binding var rating: Int
    @Binding var comment: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Item Name
            Text(item.name)
                .font(.subheadline)
                .fontWeight(.medium)
            
            // Rating Buttons
            HStack(spacing: 8) {
                Text("Rating:")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                ForEach(1...5, id: \.self) { value in
                    Button("\(value)") {
                        rating = value
                    }
                    .buttonStyle(RatingButtonStyle(isSelected: rating == value))
                }
                
                Spacer()
            }
            
            // Comment Field
            TextField("Add comment (optional)", text: $comment, axis: .vertical)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .lineLimit(2...4)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
    }
}

struct RatingButtonStyle: ButtonStyle {
    let isSelected: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(isSelected ? .white : .primary)
            .frame(width: 32, height: 32)
            .background(isSelected ? Color.blue : Color.gray.opacity(0.3))
            .cornerRadius(8)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

#Preview {
    NewEvaluationView()
}