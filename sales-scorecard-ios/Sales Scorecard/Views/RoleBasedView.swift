import SwiftUI

struct RoleBasedView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            switch authManager.currentUser?.role {
            case "ADMIN":
                AdminTabView()
            case "SALES_DIRECTOR":
                DirectorTabView()
            case "REGIONAL_SALES_MANAGER":
                ManagerTabView()
            case "SALES_LEAD":
                LeadTabView()
            case "SALESPERSON":
                SalespersonTabView()
            default:
                DefaultTabView()
            }
        }
    }
}

// Admin sees everything
struct AdminTabView: View {
    var body: some View {
        TabView {
            NewEvaluationView()
                .tabItem {
                    Image(systemName: "plus.circle")
                    Text("New Evaluation")
                }

            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }

            AnalyticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("Analytics")
                }

            ExportView()
                .tabItem {
                    Image(systemName: "square.and.arrow.up")
                    Text("Export")
                }

            AdminSettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Admin")
                }
        }
    }
}

// Sales Director sees comprehensive management tools
struct DirectorTabView: View {
    var body: some View {
        TabView {
            SalesDirectorDashboardView()
                .tabItem {
                    Image(systemName: "house")
                    Text("Dashboard")
                }
            
            AnalyticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("Analytics")
                }

            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }

            ExportView()
                .tabItem {
                    Image(systemName: "square.and.arrow.up")
                    Text("Export")
                }

            TeamManagementView()
                .tabItem {
                    Image(systemName: "person.2")
                    Text("Teams")
                }
        }
    }
}

// Sales Manager sees team management
struct ManagerTabView: View {
    var body: some View {
        TabView {
            NewEvaluationView()
                .tabItem {
                    Image(systemName: "plus.circle")
                    Text("New Evaluation")
                }

            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }

            AnalyticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("Analytics")
                }

            TeamManagementView()
                .tabItem {
                    Image(systemName: "person.2")
                    Text("Team")
                }
        }
    }
}

// Sales Lead sees limited analytics
struct LeadTabView: View {
    var body: some View {
        TabView {
            NewEvaluationView()
                .tabItem {
                    Image(systemName: "plus.circle")
                    Text("New Evaluation")
                }

            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }

            AnalyticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("Analytics")
                }
        }
    }
}

// Salesperson sees only their own data
struct SalespersonTabView: View {
    var body: some View {
        TabView {
            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("My Evaluations")
                }

            AnalyticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("My Performance")
                }

            DashboardView()
                .tabItem {
                    Image(systemName: "person")
                    Text("Profile")
                }
        }
    }
}

// Default view for unknown roles
struct DefaultTabView: View {
    var body: some View {
        TabView {
            NewEvaluationView()
                .tabItem {
                    Image(systemName: "plus.circle")
                    Text("New Evaluation")
                }

            EvaluationsHistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }
        }
    }
}//
//  RoleBasedView.swift
//  Sales Scorecard
//
//  Created by Zahari Vassilev on 13.09.25.
//

