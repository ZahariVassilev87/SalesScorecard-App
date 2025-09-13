import SwiftUI

struct DashboardView: View {
    var body: some View {
        VStack {
            Text("Sales Scorecard")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding()
            
            Text("Dashboard is working!")
                .font(.title2)
                .padding()
            
            Text("Categories: 4")
                .font(.headline)
                .padding()
            
            Spacer()
        }
        .navigationTitle("Dashboard")
    }
}
