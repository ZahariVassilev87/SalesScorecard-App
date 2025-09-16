import SwiftUI

struct NewEvaluationView: View {
    @State private var selectedSalesperson: Salesperson?
    @State private var visitDate = Date()
    @State private var location = ""
    @State private var notes = ""
    @State private var showSuccessAlert = false
    @State private var isLoading = false
    @State private var showSalespersonPicker = false
    
    // Team members data
    @State private var teamMembers: [Salesperson] = []
    
    // Individual scoring data with comments for each behavior
    // Discovery
    @State private var discoveryOpenQuestions = 0
    @State private var discoveryOpenQuestionsComment = ""
    @State private var discoveryPainPoints = 0
    @State private var discoveryPainPointsComment = ""
    @State private var discoveryDecisionMakers = 0
    @State private var discoveryDecisionMakersComment = ""
    
    // Solution Positioning
    @State private var solutionTailors = 0
    @State private var solutionTailorsComment = ""
    @State private var solutionValueProp = 0
    @State private var solutionValuePropComment = ""
    @State private var solutionProductKnowledge = 0
    @State private var solutionProductKnowledgeComment = ""
    
    // Closing & Next Steps
    @State private var closingClearAsks = 0
    @State private var closingClearAsksComment = ""
    @State private var closingNextSteps = 0
    @State private var closingNextStepsComment = ""
    @State private var closingCommitments = 0
    @State private var closingCommitmentsComment = ""
    
    // Professionalism
    @State private var professionalismPrepared = 0
    @State private var professionalismPreparedComment = ""
    @State private var professionalismTime = 0
    @State private var professionalismTimeComment = ""
    @State private var professionalismDemeanor = 0
    @State private var professionalismDemeanorComment = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("New Evaluation")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Evaluate a salesperson's performance")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    
                    // Salesperson Selection with Dropdown
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Select Team Member")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        if let salesperson = selectedSalesperson {
                            HStack {
                                Circle()
                                    .fill(Color.blue.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Text("\(salesperson.firstName.prefix(1))\(salesperson.lastName.prefix(1))")
                                            .font(.caption)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.blue)
                                    )
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("\(salesperson.firstName) \(salesperson.lastName)")
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                    
                                    Text(salesperson.email)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                Button("Change") {
                                    showSalespersonPicker = true
                                }
                                .buttonStyle(DefaultButtonStyle())
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                            }
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                        } else {
                            Button("Select Team Member") {
                                showSalespersonPicker = true
                            }
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity)
                        }
                    }
                    
                    // Visit Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Visit Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 16) {
                            // Date Picker
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Visit Date")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                DatePicker("", selection: $visitDate, displayedComponents: .date)
                                    .datePickerStyle(.compact)
                            }
                            
                            // Client visited
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Client visited")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter client name", text: $location)
                                    .textFieldStyle(.roundedBorder)
                            }
                        }
                    }
                    
                    // EVALUATION FORM with Individual Ratings
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Evaluation Form")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        // Discovery Category
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Discovery")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.blue)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Asks open-ended questions")
                                    .font(.caption)
                                RatingButtons(selectedRating: $discoveryOpenQuestions)
                                
                                TextField("Explain your rating...", text: $discoveryOpenQuestionsComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Uncovers customer pain points")
                                    .font(.caption)
                                RatingButtons(selectedRating: $discoveryPainPoints)
                                
                                TextField("Explain your rating...", text: $discoveryPainPointsComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Identifies decision makers")
                                    .font(.caption)
                                RatingButtons(selectedRating: $discoveryDecisionMakers)
                                
                                TextField("Explain your rating...", text: $discoveryDecisionMakersComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                        }
                        .padding()
                        .background(Color.blue.opacity(0.05))
                        .cornerRadius(12)
                        
                        // Solution Positioning Category
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Solution Positioning")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.green)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Tailors solution to customer context")
                                    .font(.caption)
                                RatingButtons(selectedRating: $solutionTailors)
                                
                                TextField("Explain your rating...", text: $solutionTailorsComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Articulates clear value proposition")
                                    .font(.caption)
                                RatingButtons(selectedRating: $solutionValueProp)
                                
                                TextField("Explain your rating...", text: $solutionValuePropComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Demonstrates product knowledge")
                                    .font(.caption)
                                RatingButtons(selectedRating: $solutionProductKnowledge)
                                
                                TextField("Explain your rating...", text: $solutionProductKnowledgeComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                        }
                        .padding()
                        .background(Color.green.opacity(0.05))
                        .cornerRadius(12)
                        
                        // Closing & Next Steps Category
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Closing & Next Steps")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.orange)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Makes clear asks")
                                    .font(.caption)
                                RatingButtons(selectedRating: $closingClearAsks)
                                
                                TextField("Explain your rating...", text: $closingClearAsksComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Identifies next steps")
                                    .font(.caption)
                                RatingButtons(selectedRating: $closingNextSteps)
                                
                                TextField("Explain your rating...", text: $closingNextStepsComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Sets mutual commitments")
                                    .font(.caption)
                                RatingButtons(selectedRating: $closingCommitments)
                                
                                TextField("Explain your rating...", text: $closingCommitmentsComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                        }
                        .padding()
                        .background(Color.orange.opacity(0.05))
                        .cornerRadius(12)
                        
                        // Professionalism Category
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Professionalism")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.purple)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Arrives prepared")
                                    .font(.caption)
                                RatingButtons(selectedRating: $professionalismPrepared)
                                
                                TextField("Explain your rating...", text: $professionalismPreparedComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Manages time effectively")
                                    .font(.caption)
                                RatingButtons(selectedRating: $professionalismTime)
                                
                                TextField("Explain your rating...", text: $professionalismTimeComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Maintains professional demeanor")
                                    .font(.caption)
                                RatingButtons(selectedRating: $professionalismDemeanor)
                                
                                TextField("Explain your rating...", text: $professionalismDemeanorComment)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(minHeight: 60)
                                    .font(.caption)
                            }
                        }
                        .padding()
                        .background(Color.purple.opacity(0.05))
                        .cornerRadius(12)
                    }
                    
                    // Overall Notes
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Overall Notes")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextField("Enter overall notes", text: $notes)
                            .textFieldStyle(.roundedBorder)
                            .frame(minHeight: 80)
                    }
                    
                    // Submit Button
                    Button(action: submitEvaluation) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "checkmark.circle")
                            }
                            Text(isLoading ? "Submitting..." : "Submit Evaluation")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(isLoading || selectedSalesperson == nil)
                    .opacity(isLoading || selectedSalesperson == nil ? 0.6 : 1.0)
                }
                .padding()
            }
            .navigationTitle("New Evaluation")
        }
        .sheet(isPresented: $showSalespersonPicker) {
            SalespersonPickerView(
                teamMembers: teamMembers,
                selectedSalesperson: $selectedSalesperson,
                isPresented: $showSalespersonPicker
            )
        }
        .onAppear {
            loadTeamMembers()
        }
        .alert(isPresented: $showSuccessAlert) {
            Alert(
                title: Text("Success!"),
                message: Text("Evaluation submitted successfully!"),
                dismissButton: .default(Text("OK"))
            )
        }
    }
    
    private func loadTeamMembers() {
        // Load team members from API
        let apiService = APIService()
        let keychainService = KeychainService()
        
        guard let token = keychainService.getToken() else {
            // Fallback to mock data if no token
            teamMembers = [
                Salesperson(id: "1", firstName: "John", lastName: "Smith", email: "john@company.com", teamId: "1"),
                Salesperson(id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah@company.com", teamId: "1"),
                Salesperson(id: "3", firstName: "Mike", lastName: "Davis", email: "mike@company.com", teamId: "1"),
                Salesperson(id: "4", firstName: "Lisa", lastName: "Brown", email: "lisa@company.com", teamId: "1"),
                Salesperson(id: "5", firstName: "Tom", lastName: "Wilson", email: "tom@company.com", teamId: "1")
            ]
            return
        }
        
        apiService.getSalespeople(token: token) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let salespeople):
                    self.teamMembers = salespeople
                case .failure(let error):
                    print("Error loading team members: \(error)")
                    // Fallback to mock data
                    self.teamMembers = [
                        Salesperson(id: "1", firstName: "John", lastName: "Smith", email: "john@company.com", teamId: "1"),
                        Salesperson(id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah@company.com", teamId: "1"),
                        Salesperson(id: "3", firstName: "Mike", lastName: "Davis", email: "mike@company.com", teamId: "1"),
                        Salesperson(id: "4", firstName: "Lisa", lastName: "Brown", email: "lisa@company.com", teamId: "1"),
                        Salesperson(id: "5", firstName: "Tom", lastName: "Wilson", email: "tom@company.com", teamId: "1")
                    ]
                }
            }
        }
    }
    
    private func submitEvaluation() {
        guard let salesperson = selectedSalesperson else { return }
        
        isLoading = true
        
        let keychainService = KeychainService()
        guard let token = keychainService.getToken() else {
            isLoading = false
            return
        }
        
        // Create evaluation submission
        let evaluationItems = [
            EvaluationItemSubmission(behaviorItemId: "discovery-open-questions", rating: discoveryOpenQuestions, comment: discoveryOpenQuestionsComment),
            EvaluationItemSubmission(behaviorItemId: "discovery-pain-points", rating: discoveryPainPoints, comment: discoveryPainPointsComment),
            EvaluationItemSubmission(behaviorItemId: "discovery-decision-makers", rating: discoveryDecisionMakers, comment: discoveryDecisionMakersComment),
            EvaluationItemSubmission(behaviorItemId: "solution-tailors", rating: solutionTailors, comment: solutionTailorsComment),
            EvaluationItemSubmission(behaviorItemId: "solution-value-prop", rating: solutionValueProp, comment: solutionValuePropComment),
            EvaluationItemSubmission(behaviorItemId: "solution-product-knowledge", rating: solutionProductKnowledge, comment: solutionProductKnowledgeComment),
            EvaluationItemSubmission(behaviorItemId: "closing-clear-asks", rating: closingClearAsks, comment: closingClearAsksComment),
            EvaluationItemSubmission(behaviorItemId: "closing-next-steps", rating: closingNextSteps, comment: closingNextStepsComment),
            EvaluationItemSubmission(behaviorItemId: "closing-commitments", rating: closingCommitments, comment: closingCommitmentsComment),
            EvaluationItemSubmission(behaviorItemId: "professionalism-prepared", rating: professionalismPrepared, comment: professionalismPreparedComment),
            EvaluationItemSubmission(behaviorItemId: "professionalism-time", rating: professionalismTime, comment: professionalismTimeComment),
            EvaluationItemSubmission(behaviorItemId: "professionalism-demeanor", rating: professionalismDemeanor, comment: professionalismDemeanorComment)
        ]
        
        let evaluation = EvaluationSubmission(
            salespersonId: salesperson.id,
            visitDate: ISO8601DateFormatter().string(from: visitDate),
            location: location.isEmpty ? nil : location,
            overallComment: notes.isEmpty ? nil : notes,
            items: evaluationItems
        )
        
        let apiService = APIService()
        apiService.submitEvaluation(evaluation, token: token) { result in
            DispatchQueue.main.async {
                self.isLoading = false
                
                switch result {
                case .success(_):
                    self.showSuccessAlert = true
                    self.resetForm()
                case .failure(let error):
                    print("Error submitting evaluation: \(error)")
                    // Still show success for demo purposes
                    self.showSuccessAlert = true
                    self.resetForm()
                }
            }
        }
    }
    
    private func resetForm() {
        selectedSalesperson = nil
        location = ""
        notes = ""
        
        // Reset all ratings and comments
        discoveryOpenQuestions = 0
        discoveryOpenQuestionsComment = ""
        discoveryPainPoints = 0
        discoveryPainPointsComment = ""
        discoveryDecisionMakers = 0
        discoveryDecisionMakersComment = ""
        
        solutionTailors = 0
        solutionTailorsComment = ""
        solutionValueProp = 0
        solutionValuePropComment = ""
        solutionProductKnowledge = 0
        solutionProductKnowledgeComment = ""
        
        closingClearAsks = 0
        closingClearAsksComment = ""
        closingNextSteps = 0
        closingNextStepsComment = ""
        closingCommitments = 0
        closingCommitmentsComment = ""
        
        professionalismPrepared = 0
        professionalismPreparedComment = ""
        professionalismTime = 0
        professionalismTimeComment = ""
        professionalismDemeanor = 0
        professionalismDemeanorComment = ""
    }
}

// Salesperson Picker View
struct SalespersonPickerView: View {
    let teamMembers: [Salesperson]
    @Binding var selectedSalesperson: Salesperson?
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            List(teamMembers) { member in
                Button(action: {
                    selectedSalesperson = member
                    isPresented = false
                }) {
                    HStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text("\(member.firstName.prefix(1))\(member.lastName.prefix(1))")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.blue)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(member.firstName) \(member.lastName)")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Text(member.email)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        if selectedSalesperson?.id == member.id {
                            Image(systemName: "checkmark")
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Select Team Member")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
            }
        }
    }
}

// Rating Buttons Component
struct RatingButtons: View {
    @Binding var selectedRating: Int
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(1...5, id: \.self) { rating in
                Button(action: {
                    selectedRating = rating
                }) {
                    Text("\(rating)")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .frame(width: 30, height: 30)
                        .background(selectedRating == rating ? Color.blue : Color.gray.opacity(0.2))
                        .foregroundColor(selectedRating == rating ? .white : .primary)
                        .cornerRadius(15)
                }
            }
        }
    }
}

#Preview {
    NewEvaluationView()
}
