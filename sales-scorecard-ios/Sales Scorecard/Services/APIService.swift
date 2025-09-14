import Foundation

class APIService {
    private let baseURL = "https://salesscorecard-app-production.up.railway.app" // P
    
    private let isDevelopmentMode = false // Production mode
    
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
                        token: "dev-token-123"
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
    
    func getCategories(completion: @escaping (Result<[BehaviorCategory], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/public-admin/categories") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
    
    // MARK: - Team Management API Methods
    func getSalespeople(token: String, completion: @escaping (Result<[Salesperson], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/organizations/salespeople") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
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
    
    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .serverError(let code):
            return "Server error: \(code)"
        }
    }
}
