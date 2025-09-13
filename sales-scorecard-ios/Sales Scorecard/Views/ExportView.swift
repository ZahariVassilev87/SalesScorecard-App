import SwiftUI

struct ExportView: View {
    @State private var selectedFormat = "PDF"
    @State private var selectedDateRange = "Last 30 days"
    @State private var selectedSalesperson = "All Salespeople"
    @State private var isExporting = false
    @State private var showingSuccess = false
    
    let formats = ["PDF", "CSV", "Excel"]
    let dateRanges = ["Last 7 days", "Last 30 days", "Last 3 months", "All time"]
    let salespeople = ["All Salespeople", "John Smith", "Sarah Johnson", "Mike Davis", "Lisa Brown"]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Export Evaluations")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("Generate reports for analysis and sharing")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(12)
                
                // Export Options
                VStack(spacing: 16) {
                    // Format Selection
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Export Format")
                            .font(.headline)
                        
                        Picker("Format", selection: $selectedFormat) {
                            ForEach(formats, id: \.self) { format in
                                Text(format).tag(format)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                    }
                    
                    // Date Range Selection
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Date Range")
                            .font(.headline)
                        
                        Picker("Date Range", selection: $selectedDateRange) {
                            ForEach(dateRanges, id: \.self) { range in
                                Text(range).tag(range)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    }
                    
                    // Salesperson Selection
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Salesperson")
                            .font(.headline)
                        
                        Picker("Salesperson", selection: $selectedSalesperson) {
                            ForEach(salespeople, id: \.self) { person in
                                Text(person).tag(person)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Export Button
                Button(action: exportData) {
                    HStack {
                        if isExporting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        }
                        Text(isExporting ? "Exporting..." : "Export Data")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(isExporting)
                .padding(.top)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Export")
        }
        .alert("Export Complete!", isPresented: $showingSuccess) {
            Button("OK") { }
        } message: {
            Text("Your \(selectedFormat) report has been generated and saved.")
        }
    }
    
    private func exportData() {
        isExporting = true
        
        // Simulate export process
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isExporting = false
            showingSuccess = true
            
            // In a real app, this would generate and save the file
            print("Exporting \(selectedFormat) for \(selectedDateRange) - \(selectedSalesperson)")
        }
    }
}//
//  ExportView.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

