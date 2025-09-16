import Foundation

class APIService {
    private let baseURL = "https://api.instorm.io" // AWS Production
    
    private let isDevelopmentMode = false // Production mode
    
    // Custom URLSession that bypasses ATS
    private lazy var urlSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        return URLSession(configuration: config)
    }()
    
    func sendMagicLink(email: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/magic-link") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                // In development mode, simulate success if server is not available
                if self.isDevelopmentMode && ((error as NSError).code == -1004 || (error as NSError).code == -1001) {
                    print("Server not available, simulating success for development")
                    completion(.success(()))
                    return
                }
                completion(.failure(error))
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    completion(.success(()))
                } else {
                    completion(.failure(APIError.serverError(httpResponse.statusCode)))
                }
            }
        }.resume()
    }
    
    func verifyMagicLink(token: String, completion: @escaping (Result<AuthResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/verify") else {
            completion(Result.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["token": token]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                // In development mode, simulate success if server is not available
                if self.isDevelopmentMode && ((error as NSError).code == -1004 || (error as NSError).code == -1001) {
                    print("Server not available, simulating auth success for development")
                    let mockAuthResponse = AuthResponse(
                        user: User(
                            id: "dev-1",
                            email: "dev@instorm.bg",
                            displayName: "Development User",
                            role: "ADMIN",
                            isActive: true,
                            createdAt: "2024-01-01T00:00:00Z",
                            updatedAt: "2024-01-01T00:00:00Z",
                            managedRegions: nil
                        ),
                        access_token: "dev-token-123"
                    )
                    completion(Result.success(mockAuthResponse))
                    return
                }
                completion(Result.failure(error))
                return
            }
            
            guard let data = data else {
                completion(Result.failure(APIError.noData))
                return
            }
            
            do {
                let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
                completion(Result.success(authResponse))
            } catch {
                completion(Result.failure(error))
            }
        }.resume()
    }
    
    func validateToken(token: String, completion: @escaping (Result<User, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/me") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let user = try JSONDecoder().decode(User.self, from: data)
                completion(.success(user))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // Password Authentication Methods
    func loginUser(email: String, password: String, completion: @escaping (Result<AuthResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/login") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        // Debug: Print request details
        print("🔍 Login Request URL: \(url)")
        print("🔍 Login Request Body: \(body)")
        if let httpBody = request.httpBody, let bodyString = String(data: httpBody, encoding: .utf8) {
            print("🔍 Login Request Body Data: \(bodyString)")
        }
        
        urlSession.dataTask(with: request) { data, response, error in
            // Check HTTP response status first
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 401 {
                    // Try to parse the error message from the response body
                    var errorMessage = "Invalid email or password"
                    if let data = data,
                       let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let message = json["message"] as? String {
                        errorMessage = message
                    }
                    completion(.failure(APIError.authenticationFailed(errorMessage)))
                    return
                } else if httpResponse.statusCode != 200 && httpResponse.statusCode != 201 {
                    completion(.failure(APIError.serverError(httpResponse.statusCode)))
                    return
                }
            }
            
            // Handle network errors
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                // Debug: Print the raw response
                if let responseString = String(data: data, encoding: .utf8) {
                    print("🔍 Raw API Response: \(responseString)")
                }
                
                let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
                print("✅ Successfully parsed AuthResponse")
                completion(.success(authResponse))
            } catch {
                print("❌ JSON Parsing Error: \(error)")
                if let responseString = String(data: data, encoding: .utf8) {
                    print("🔍 Raw response that failed to parse: \(responseString)")
                }
                completion(.failure(error))
            }
        }.resume()
    }
    
    func registerUser(email: String, password: String, displayName: String, completion: @escaping (Result<AuthResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/register") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password, "displayName": displayName]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
                completion(.success(authResponse))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getCategories(completion: @escaping (Result<[BehaviorCategory], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/public-admin/categories") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        urlSession.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let categories = try JSONDecoder().decode([BehaviorCategory].self, from: data)
                completion(.success(categories))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // MARK: - Evaluation API Methods
    func submitEvaluation(_ evaluation: EvaluationSubmission, token: String, completion: @escaping (Result<Evaluation, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/evaluations") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            request.httpBody = try JSONEncoder().encode(evaluation)
        } catch {
            completion(.failure(error))
            return
        }
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let evaluation = try JSONDecoder().decode(Evaluation.self, from: data)
                completion(.success(evaluation))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getEvaluations(token: String, completion: @escaping (Result<[Evaluation], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/evaluations") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let evaluations = try JSONDecoder().decode([Evaluation].self, from: data)
                completion(.success(evaluations))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // MARK: - Analytics API Methods
    func getAnalytics(token: String, completion: @escaping (Result<AnalyticsData, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/dashboard") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let analytics = try JSONDecoder().decode(AnalyticsData.self, from: data)
                completion(.success(analytics))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getTrends(token: String, days: Int = 30, completion: @escaping (Result<TrendsData, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/trends?days=\(days)") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let trends = try JSONDecoder().decode(TrendsData.self, from: data)
                completion(.success(trends))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getCategoryPerformance(token: String, completion: @escaping (Result<[CategoryPerformance], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/categories") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let categories = try JSONDecoder().decode([CategoryPerformance].self, from: data)
                completion(.success(categories))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getTeamPerformance(token: String, completion: @escaping (Result<[TeamPerformance], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/teams") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let teams = try JSONDecoder().decode([TeamPerformance].self, from: data)
                completion(.success(teams))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getRegionPerformance(token: String, completion: @escaping (Result<[RegionPerformance], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/regions") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let regions = try JSONDecoder().decode([RegionPerformance].self, from: data)
                completion(.success(regions))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getSalespersonPerformance(token: String, limit: Int = 10, completion: @escaping (Result<[SalespersonPerformance], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/salespeople?limit=\(limit)") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let salespeople = try JSONDecoder().decode([SalespersonPerformance].self, from: data)
                completion(.success(salespeople))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getPerformanceInsights(token: String, completion: @escaping (Result<[PerformanceInsight], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/analytics/insights") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let insights = try JSONDecoder().decode([PerformanceInsight].self, from: data)
                completion(.success(insights))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // MARK: - Export API Methods
    
    func exportEvaluationsCSV(token: String, filters: ExportFilters? = nil, completion: @escaping (Result<Data, Error>) -> Void) {
        var urlComponents = URLComponents(string: "\(baseURL)/export/evaluations/csv")
        
        if let filters = filters {
            var queryItems: [URLQueryItem] = []
            if let startDate = filters.startDate {
                queryItems.append(URLQueryItem(name: "startDate", value: startDate))
            }
            if let endDate = filters.endDate {
                queryItems.append(URLQueryItem(name: "endDate", value: endDate))
            }
            if let teamId = filters.teamId {
                queryItems.append(URLQueryItem(name: "teamId", value: teamId))
            }
            if let regionId = filters.regionId {
                queryItems.append(URLQueryItem(name: "regionId", value: regionId))
            }
            if let salespersonId = filters.salespersonId {
                queryItems.append(URLQueryItem(name: "salespersonId", value: salespersonId))
            }
            urlComponents?.queryItems = queryItems
        }
        
        guard let url = urlComponents?.url else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    func exportTeamPerformanceCSV(token: String, regionId: String? = nil, teamId: String? = nil, completion: @escaping (Result<Data, Error>) -> Void) {
        var urlComponents = URLComponents(string: "\(baseURL)/export/teams/performance/csv")
        
        var queryItems: [URLQueryItem] = []
        if let regionId = regionId {
            queryItems.append(URLQueryItem(name: "regionId", value: regionId))
        }
        if let teamId = teamId {
            queryItems.append(URLQueryItem(name: "teamId", value: teamId))
        }
        urlComponents?.queryItems = queryItems.isEmpty ? nil : queryItems
        
        guard let url = urlComponents?.url else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    func exportSalespersonPerformanceCSV(token: String, teamId: String? = nil, regionId: String? = nil, limit: Int? = nil, completion: @escaping (Result<Data, Error>) -> Void) {
        var urlComponents = URLComponents(string: "\(baseURL)/export/salespeople/performance/csv")
        
        var queryItems: [URLQueryItem] = []
        if let teamId = teamId {
            queryItems.append(URLQueryItem(name: "teamId", value: teamId))
        }
        if let regionId = regionId {
            queryItems.append(URLQueryItem(name: "regionId", value: regionId))
        }
        if let limit = limit {
            queryItems.append(URLQueryItem(name: "limit", value: String(limit)))
        }
        urlComponents?.queryItems = queryItems.isEmpty ? nil : queryItems
        
        guard let url = urlComponents?.url else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    func exportAnalyticsCSV(token: String, type: AnalyticsExportType = .dashboard, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/export/analytics/csv?type=\(type.rawValue)") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    func exportEvaluationPDF(token: String, evaluationId: String, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/export/evaluation/\(evaluationId)/pdf") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    // MARK: - Team Management API Methods
    func getSalespeople(token: String, completion: @escaping (Result<[Salesperson], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/organizations/salespeople") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let salespeople = try JSONDecoder().decode([Salesperson].self, from: data)
                completion(.success(salespeople))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // MARK: - New Hierarchy API Methods
    func getTeams(token: String, completion: @escaping (Result<[Team], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/public-admin/teams") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        // No authentication needed for public admin endpoints
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let teams = try JSONDecoder().decode([Team].self, from: data)
                completion(.success(teams))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getRegions(token: String, completion: @escaping (Result<[Region], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/public-admin/regions") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        // No authentication needed for public admin endpoints
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let regions = try JSONDecoder().decode([Region].self, from: data)
                completion(.success(regions))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getSalesDirectors(token: String, completion: @escaping (Result<[User], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/public-admin/directors") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        // No authentication needed for public admin endpoints
        
        urlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let response = try JSONDecoder().decode([String: [User]].self, from: data)
                let directors = response["directors"] ?? []
                completion(.success(directors))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

enum APIError: Error {
    case invalidURL
    case noData
    case serverError(Int)
    case authenticationFailed(String)
    
    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .serverError(let code):
            return "Server error: \(code)"
        case .authenticationFailed(let message):
            return message
        }
    }
}
