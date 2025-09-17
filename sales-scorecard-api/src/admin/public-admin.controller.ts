import { Controller, Get, Post, Delete, Body, Param, Query, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { ScoringService } from '../scoring/scoring.service';
import { SeedService } from '../scoring/seed.service';
import { AuthService } from '../auth/auth.service';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('public-admin')
export class PublicAdminController {
  constructor(
    private scoringService: ScoringService,
    private seedService: SeedService,
    private authService: AuthService,
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  @Get('login')
  async getAdminLogin(@Res() res: Response) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sales Scorecard Admin Login</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container { 
                background: white; 
                border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                padding: 40px;
                width: 100%;
                max-width: 400px;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
            }
            .header h1 { 
                margin: 0; 
                color: #333; 
                font-size: 2em; 
                font-weight: 300; 
            }
            .header p { 
                margin: 10px 0 0 0; 
                color: #666; 
            }
            .form-group { 
                margin-bottom: 20px; 
            }
            .form-group label { 
                display: block; 
                margin-bottom: 8px; 
                font-weight: 600; 
                color: #555; 
            }
            .form-group input { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 6px; 
                font-size: 16px; 
                box-sizing: border-box; 
            }
            .form-group input:focus { 
                outline: none; 
                border-color: #667eea; 
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
            }
            .btn { 
                width: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                border: none; 
                padding: 12px; 
                border-radius: 6px; 
                font-size: 16px; 
                font-weight: 600; 
                cursor: pointer; 
                transition: all 0.3s ease; 
            }
            .btn:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); 
            }
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            .status { 
                margin-top: 15px; 
                padding: 12px; 
                border-radius: 6px; 
                font-weight: 500; 
                text-align: center;
            }
            .status.success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            .status.error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
            .loading {
                display: none;
                text-align: center;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="header">
                <h1>🔐 Admin Login</h1>
                <p>Sales Scorecard Admin Panel</p>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="email" placeholder="admin@example.com" required>
                </div>
                
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="password" placeholder="Enter password" required>
                </div>
                
                <button type="submit" class="btn" id="loginBtn">Login</button>
                
                <div class="loading" id="loading">
                    Authenticating...
                </div>
                
                <div id="status" class="status"></div>
            </form>
        </div>
        
        <script>
            const API_BASE = window.location.origin;
            
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const loginBtn = document.getElementById('loginBtn');
                const loading = document.getElementById('loading');
                const status = document.getElementById('status');
                
                // Show loading state
                loginBtn.disabled = true;
                loading.style.display = 'block';
                status.style.display = 'none';
                
                try {
                    const response = await fetch(API_BASE + '/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Check if user is admin
                        if (data.user.role === 'ADMIN') {
                            // Store token and redirect to admin panel
                            localStorage.setItem('adminToken', data.access_token);
                            localStorage.setItem('adminUser', JSON.stringify(data.user));
                            window.location.href = API_BASE + '/public-admin/panel?token=' + encodeURIComponent(data.access_token);
                        } else {
                            showStatus('Access denied. Admin privileges required.', 'error');
                        }
                    } else {
                        showStatus(data.message || 'Login failed', 'error');
                    }
                } catch (error) {
                    showStatus('Network error: ' + error.message, 'error');
                } finally {
                    loginBtn.disabled = false;
                    loading.style.display = 'none';
                }
            });
            
            function showStatus(message, type) {
                const status = document.getElementById('status');
                status.textContent = message;
                status.className = 'status ' + type;
                status.style.display = 'block';
            }
            
            // Clear any existing tokens to force fresh login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
        </script>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('panel')
  async getAdminPanel(@Req() req: Request, @Res() res: Response) {
    // Check for admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.query.token || 
                  req.cookies?.adminToken;
    
    if (!token) {
      // Redirect to login page instead of showing access denied
      return res.redirect('/public-admin/login');
    }

    // Verify token and check admin role
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.role !== 'ADMIN') {
        // Redirect to login page for insufficient privileges
        return res.redirect('/public-admin/login');
      }
    } catch (error) {
      // Redirect to login page for invalid session
      return res.redirect('/public-admin/login');
    }

    try {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Sales Scorecard Admin Panel</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: #f5f5f5; 
              }
              .container { 
                  max-width: 1200px; 
                  margin: 0 auto; 
                  background: white; 
                  border-radius: 8px; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                  overflow: hidden;
              }
              .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 30px; 
                  text-align: center; 
                  position: relative;
              }
              .logout-btn {
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  background: rgba(255,255,255,0.2);
                  color: white;
                  border: 1px solid rgba(255,255,255,0.3);
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  transition: all 0.3s ease;
              }
              .logout-btn:hover {
                  background: rgba(255,255,255,0.3);
              }
              .header h1 { margin: 0; font-size: 2.5em; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; }
              .content { padding: 30px; }
              .section { 
                  margin: 30px 0; 
                  padding: 25px; 
                  border: 1px solid #e0e0e0; 
                  border-radius: 8px; 
                  background: #fafafa;
              }
              .section h2 { 
                  margin: 0 0 20px 0; 
                  color: #333; 
                  border-bottom: 2px solid #667eea; 
                  padding-bottom: 10px; 
              }
              .form-group { 
                  margin: 15px 0; 
              }
              .form-group label { 
                  display: block; 
                  margin-bottom: 5px; 
                  font-weight: 600; 
                  color: #555; 
              }
              .form-group input, .form-group select { 
                  width: 100%; 
                  padding: 12px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  font-size: 14px; 
                  box-sizing: border-box;
              }
              .form-group input:focus, .form-group select:focus { 
                  outline: none; 
                  border-color: #667eea; 
                  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2); 
              }
              .btn { 
                  padding: 12px 24px; 
                  margin: 5px; 
                  background: #667eea; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 14px; 
                  font-weight: 600;
                  transition: background 0.2s;
              }
              .btn:hover { background: #5a6fd8; }
              .btn-success { background: #28a745; }
              .btn-success:hover { background: #218838; }
              .btn-danger { background: #dc3545; }
              .btn-danger:hover { background: #c82333; }
              .btn-secondary { background: #6c757d; }
              .btn-secondary:hover { background: #5a6268; }
              .status { 
                  padding: 10px; 
                  margin: 10px 0; 
                  border-radius: 4px; 
                  display: none;
              }
              .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
              .user-list { 
                  margin-top: 20px; 
              }
              .user-item { 
                  padding: 15px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  margin: 10px 0; 
                  background: white; 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center;
              }
              .user-info { flex: 1; }
              .user-actions { display: flex; gap: 10px; }
              .grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 30px; 
              }
              @media (max-width: 768px) {
                  .grid { grid-template-columns: 1fr; }
                  .container { margin: 10px; }
                  .content { padding: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <button class="logout-btn" onclick="logout()">Logout</button>
                  <h1>🎯 Sales Scorecard Admin Panel</h1>
                  <p>Manage users, teams, and system settings</p>
              </div>
              
              <div class="content">
                  <div class="grid">
                      <!-- User Management -->
                      <div class="section">
                          <h2>👤 User Management</h2>
                          
                          <div class="form-group">
                              <label>Email:</label>
                              <input type="email" id="userEmail" placeholder="user@example.com" required>
                          </div>
                          
                          <div class="form-group">
                              <label>Display Name:</label>
                              <input type="text" id="userName" placeholder="John Doe" required>
                          </div>
                          
                          <div class="form-group">
                              <label>Role:</label>
                              <select id="userRole" required>
                                  <option value="">Select Role</option>
                                  <option value="ADMIN">Admin</option>
                                  <option value="SALES_DIRECTOR">Sales Director</option>
                                  <option value="REGIONAL_SALES_MANAGER">Regional Sales Manager</option>
                                  <option value="SALES_LEAD">Sales Lead</option>
                                  <option value="SALESPERSON">Salesperson</option>
                              </select>
                          </div>
                          
                          <div class="form-group">
                              <label>Password:</label>
                              <input type="password" id="userPassword" placeholder="Enter password" required>
                          </div>
                          
                          <button class="btn btn-success" onclick="createUser()">Create User</button>
                          <button class="btn btn-secondary" onclick="loadUsers()">Load Users</button>
                          
                          <div id="userStatus" class="status"></div>
                          
                          <div id="userList" class="user-list"></div>
                      </div>
                      
                      <!-- Admin User Creation -->
                      <div class="section">
                          <h2>🔐 Create Admin User</h2>
                          
                          <div class="form-group">
                              <label>Admin Email:</label>
                              <input type="email" id="adminEmail" placeholder="admin@example.com" required>
                          </div>
                          
                          <div class="form-group">
                              <label>Admin Name:</label>
                              <input type="text" id="adminName" placeholder="Admin User" required>
                          </div>
                          
                          <div class="form-group">
                              <label>Admin Password:</label>
                              <input type="password" id="adminPassword" placeholder="Enter admin password" required>
                          </div>
                          
                          <button class="btn btn-success" onclick="createAdmin()">Create Admin</button>
                          
                          <div id="adminStatus" class="status"></div>
                      </div>
                  </div>
                  
                  <!-- User Hierarchy Management -->
                  <div class="section">
                      <h2>🏢 User Hierarchy Management</h2>
                      
                      <div class="form-group">
                          <label>Select User:</label>
                          <select id="hierarchyUser" onchange="loadUserHierarchy()">
                              <option value="">Select a user</option>
                          </select>
                      </div>
                      
                      <div id="hierarchyInfo" style="display: none;">
                          <div class="form-group">
                              <label>Current Manager:</label>
                              <div id="currentManager">None</div>
                          </div>
                          
                          <div class="form-group">
                              <label>Assign New Manager:</label>
                              <select id="newManager">
                                  <option value="">Select a manager</option>
                              </select>
                          </div>
                          
                          <button class="btn btn-success" onclick="assignManager()">Assign Manager</button>
                          <button class="btn btn-danger" onclick="removeManager()">Remove Manager</button>
                      </div>
                      
                      <div id="hierarchyStatus" class="status"></div>
                  </div>
                  
                  <!-- System Actions -->
                  <div class="section">
                      <h2>⚙️ System Actions</h2>
                      <button class="btn" onclick="testConnection()">Test API Connection</button>                                                               
                      <button class="btn btn-secondary" onclick="loadDashboard()">Load Dashboard</button>                                                       
                      <button class="btn btn-danger" onclick="seedData()">Seed Sample Data</button>                                                             
                      
                      <div id="systemStatus" class="status"></div>
                  </div>
                  
                  <!-- Scorecard Management -->
                  <div class="section">
                      <h2>📊 Scorecard Management</h2>
                      <p>Create and manage different evaluation scorecards for different roles</p>
                      
                      <div class="form-group">
                          <label>Scorecard Type:</label>
                          <select id="scorecardType" onchange="loadScorecardTemplate()">
                              <option value="">Select Scorecard Type</option>
                              <option value="SALESPERSON">Salesperson Evaluation</option>
                              <option value="SALES_LEAD">Sales Lead Evaluation</option>
                              <option value="REGIONAL_MANAGER">Regional Manager Evaluation</option>
                              <option value="SALES_DIRECTOR">Sales Director Evaluation</option>
                              <option value="CUSTOM">Custom Scorecard</option>
                          </select>
                      </div>
                      
                      <div id="scorecardForm" style="display: none;">
                          <div class="form-group">
                              <label>Scorecard Name:</label>
                              <input type="text" id="scorecardName" placeholder="e.g., Sales Skills Evaluation">
                          </div>
                          
                          <div class="form-group">
                              <label>Description:</label>
                              <textarea id="scorecardDescription" rows="3" placeholder="Describe what this scorecard evaluates"></textarea>
                          </div>
                          
                          <div id="categoriesContainer">
                              <h3>Evaluation Categories</h3>
                              <div id="categoriesList"></div>
                              <button type="button" class="btn btn-secondary" onclick="addCategory()">+ Add Category</button>
                          </div>
                          
                          <div style="margin-top: 20px;">
                              <button class="btn btn-success" onclick="saveScorecard()">Save Scorecard</button>
                              <button class="btn btn-secondary" onclick="previewScorecard()">Preview</button>
                              <button class="btn" onclick="loadExistingScorecards()">Load Existing</button>
                          </div>
                      </div>
                      
                      <div id="scorecardStatus" class="status"></div>
                      
                      <div id="existingScorecards" style="display: none;">
                          <h3>Existing Scorecards</h3>
                          <div id="scorecardsList"></div>
                      </div>
                  </div>
              </div>
          </div>
          
          <script>
              const API_BASE = window.location.origin;
              
              // Check authentication
              const token = localStorage.getItem('adminToken');
              if (!token) {
                  window.location.href = API_BASE + '/public-admin/login';
              }
              
              // Add token to all API requests
              const apiHeaders = {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
              };
              
              function logout() {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  window.location.href = API_BASE + '/public-admin/login';
              }
              
              function showStatus(elementId, message, type = 'success') {
                  const element = document.getElementById(elementId);
                  element.textContent = message;
                  element.className = 'status ' + type;
                  element.style.display = 'block';
                  setTimeout(() => {
                      element.style.display = 'none';
                  }, 5000);
              }
              
              async function createUser() {
                  const email = document.getElementById('userEmail').value;
                  const name = document.getElementById('userName').value;
                  const role = document.getElementById('userRole').value;
                  const password = document.getElementById('userPassword').value;
                  
                  if (!email || !name || !role || !password) {
                      showStatus('userStatus', 'Please fill in all fields', 'error');
                      return;
                  }
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users', {
                          method: 'POST',
                          headers: apiHeaders,
                          body: JSON.stringify({ email, displayName: name, role, password })
                      });
                      
                      if (response.ok) {
                          showStatus('userStatus', 'User created successfully!', 'success');
                          document.getElementById('userEmail').value = '';
                          document.getElementById('userName').value = '';
                          document.getElementById('userRole').value = '';
                          document.getElementById('userPassword').value = '';
                          loadUsers();
                      } else {
                          const error = await response.text();
                          showStatus('userStatus', 'Error: ' + error, 'error');
                      }
                  } catch (error) {
                      showStatus('userStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function createAdmin() {
                  const email = document.getElementById('adminEmail').value;
                  const name = document.getElementById('adminName').value;
                  const password = document.getElementById('adminPassword').value;
                  
                  if (!email || !name || !password) {
                      showStatus('adminStatus', 'Please fill in all fields', 'error');
                      return;
                  }
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/create-admin', {
                          method: 'POST',
                          headers: apiHeaders,
                          body: JSON.stringify({ email, displayName: name, password })
                      });
                      
                      if (response.ok) {
                          showStatus('adminStatus', 'Admin user created successfully!', 'success');
                          document.getElementById('adminEmail').value = '';
                          document.getElementById('adminName').value = '';
                          document.getElementById('adminPassword').value = '';
                      } else {
                          const error = await response.text();
                          showStatus('adminStatus', 'Error: ' + error, 'error');
                      }
                  } catch (error) {
                      showStatus('adminStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function loadUsers() {
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users', {
                          headers: apiHeaders
                      });
                      if (response.ok) {
                          const users = await response.json();
                          displayUsers(users);
                      } else {
                          showStatus('userStatus', 'Error loading users', 'error');
                      }
                  } catch (error) {
                      showStatus('userStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              function displayUsers(users) {
                  const userList = document.getElementById('userList');
                  if (users.length === 0) {
                      userList.innerHTML = '<p>No users found.</p>';
                      return;
                  }
                  
                  userList.innerHTML = users.map(user => \`
                      <div class="user-item">
                          <div class="user-info">
                              <strong>\${user.displayName}</strong> (\${user.email})<br>
                              <small>Role: \${user.role} | Status: \${user.isActive ? 'Active' : 'Inactive'}</small>
                          </div>
                          <div class="user-actions">
                              <button class="btn btn-secondary" onclick="resetPassword('\${user.id}')">Reset Password</button>
                              <button class="btn btn-danger" onclick="deleteUser('\${user.id}')">Delete</button>
                          </div>
                      </div>
                  \`).join('');
              }
              
              async function resetPassword(userId) {
                  const newPassword = prompt('Enter new password:');
                  if (!newPassword) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users/' + userId + '/reset-password', {
                          method: 'POST',
                          headers: apiHeaders,
                          body: JSON.stringify({ newPassword })
                      });
                      
                      if (response.ok) {
                          showStatus('userStatus', 'Password reset successfully!', 'success');
                      } else {
                          showStatus('userStatus', 'Error resetting password', 'error');
                      }
                  } catch (error) {
                      showStatus('userStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function deleteUser(userId) {
                  if (!confirm('Are you sure you want to delete this user?')) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users/' + userId, {
                          method: 'DELETE',
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          showStatus('userStatus', 'User deleted successfully!', 'success');
                          loadUsers();
                      } else {
                          showStatus('userStatus', 'Error deleting user', 'error');
                      }
                  } catch (error) {
                      showStatus('userStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function testConnection() {
                  try {
                      const response = await fetch(API_BASE + '/health');
                      if (response.ok) {
                          showStatus('systemStatus', 'API connection successful!', 'success');
                      } else {
                          showStatus('systemStatus', 'API connection failed', 'error');
                      }
                  } catch (error) {
                      showStatus('systemStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function loadDashboard() {
                  try {
                      const response = await fetch(API_BASE + '/public-admin/dashboard', {
                          headers: apiHeaders
                      });
                      if (response.ok) {
                          const data = await response.json();
                          showStatus('systemStatus', 'Dashboard loaded: ' + JSON.stringify(data), 'success');
                      } else {
                          showStatus('systemStatus', 'Error loading dashboard', 'error');
                      }
                  } catch (error) {
                      showStatus('systemStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function seedData() {
                  if (!confirm('This will add sample data to the database. Continue?')) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/seed/sample-data', {
                          method: 'POST',
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          showStatus('systemStatus', 'Sample data seeded successfully!', 'success');
                      } else {
                          showStatus('systemStatus', 'Error seeding data', 'error');
                      }
                  } catch (error) {
                      showStatus('systemStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              // Hierarchy management functions
              async function loadUserHierarchy() {
                  const userId = document.getElementById('hierarchyUser').value;
                  if (!userId) {
                      document.getElementById('hierarchyInfo').style.display = 'none';
                      return;
                  }
                  
                  try {
                      // Load user hierarchy
                      const hierarchyResponse = await fetch(API_BASE + '/public-admin/users/' + userId + '/hierarchy', {
                          headers: apiHeaders
                      });
                      if (hierarchyResponse.ok) {
                          const hierarchy = await hierarchyResponse.json();
                          
                          // Show current manager
                          const currentManagerDiv = document.getElementById('currentManager');
                          if (hierarchy.manager) {
                              currentManagerDiv.innerHTML = hierarchy.manager.displayName + ' (' + hierarchy.manager.role + ')';
                          } else {
                              currentManagerDiv.innerHTML = 'None';
                          }
                          
                          // Load available managers
                          const managersResponse = await fetch(API_BASE + '/public-admin/users/' + userId + '/available-managers', {
                              headers: apiHeaders
                          });
                          if (managersResponse.ok) {
                              const managers = await managersResponse.json();
                              const managerSelect = document.getElementById('newManager');
                              managerSelect.innerHTML = '<option value="">Select a manager</option>';
                              
                              managers.forEach(manager => {
                                  const option = document.createElement('option');
                                  option.value = manager.id;
                                  option.textContent = manager.displayName + ' (' + manager.role + ')';
                                  managerSelect.appendChild(option);
                              });
                          }
                          
                          document.getElementById('hierarchyInfo').style.display = 'block';
                      } else {
                          showStatus('hierarchyStatus', 'Error loading user hierarchy', 'error');
                      }
                  } catch (error) {
                      showStatus('hierarchyStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function assignManager() {
                  const userId = document.getElementById('hierarchyUser').value;
                  const managerId = document.getElementById('newManager').value;
                  
                  if (!userId || !managerId) {
                      showStatus('hierarchyStatus', 'Please select both user and manager', 'error');
                      return;
                  }
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users/' + userId + '/assign-manager', {
                          method: 'POST',
                          headers: apiHeaders,
                          body: JSON.stringify({ managerId })
                      });
                      
                      if (response.ok) {
                          showStatus('hierarchyStatus', 'Manager assigned successfully!', 'success');
                          loadUserHierarchy(); // Refresh the hierarchy info
                      } else {
                          const error = await response.text();
                          showStatus('hierarchyStatus', 'Error: ' + error, 'error');
                      }
                  } catch (error) {
                      showStatus('hierarchyStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function removeManager() {
                  const userId = document.getElementById('hierarchyUser').value;
                  
                  if (!userId) {
                      showStatus('hierarchyStatus', 'Please select a user', 'error');
                      return;
                  }
                  
                  if (!confirm('Are you sure you want to remove the manager assignment?')) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users/' + userId + '/manager', {
                          method: 'DELETE',
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          showStatus('hierarchyStatus', 'Manager removed successfully!', 'success');
                          loadUserHierarchy(); // Refresh the hierarchy info
                      } else {
                          const error = await response.text();
                          showStatus('hierarchyStatus', 'Error: ' + error, 'error');
                      }
                  } catch (error) {
                      showStatus('hierarchyStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              // Scorecard Management Functions
              const scorecardTemplates = {
                  SALESPERSON: {
                      name: 'Sales Skills Evaluation',
                      description: 'Evaluates core sales skills and behaviors',
                      categories: [
                          {
                              name: 'Discovery',
                              weight: 25,
                              items: [
                                  'Asks open-ended questions',
                                  'Uncovers customer pain points',
                                  'Identifies decision makers',
                                  'Understands customer needs',
                                  'Confirms success criteria'
                              ]
                          },
                          {
                              name: 'Solution Positioning',
                              weight: 25,
                              items: [
                                  'Tailors solution to customer context',
                                  'Articulates clear value proposition',
                                  'Demonstrates product knowledge',
                                  'Handles objections effectively',
                                  'Shows ROI and business impact'
                              ]
                          },
                          {
                              name: 'Closing & Next Steps',
                              weight: 25,
                              items: [
                                  'Makes clear asks',
                                  'Identifies next steps',
                                  'Sets mutual commitments',
                                  'Follows up appropriately',
                                  'Manages timeline expectations'
                              ]
                          },
                          {
                              name: 'Professionalism',
                              weight: 25,
                              items: [
                                  'Arrives prepared',
                                  'Manages time effectively',
                                  'Maintains professional demeanor',
                                  'Listens actively',
                                  'Communicates clearly'
                              ]
                          }
                      ]
                  },
                  SALES_LEAD: {
                      name: 'Sales Lead Coaching Evaluation',
                      description: 'Evaluates Sales Lead coaching abilities in the field - for Regional Managers to assess Sales Leads',
                      categories: [
                          {
                              name: 'Field Coaching Assessment',
                              weight: 100,
                              items: [
                                  'Asks exploratory/diagnostic questions before offering feedback',
                                  'Provides feedback on behavior, not just results',
                                  'Involves rep in setting next steps for improvement',
                                  'Goal links to a specific sales activity (e.g., opening visits, upselling, objection handling)',
                                  'Manager identifies a specific behavior that needs improvement',
                                  'The manager discusses what was the behavior effect over the customer'
                              ]
                          }
                      ]
                  },
                  REGIONAL_MANAGER: {
                      name: 'Management Skills Evaluation',
                      description: 'Evaluates leadership and management capabilities',
                      categories: [
                          {
                              name: 'Leadership',
                              weight: 30,
                              items: [
                                  'Inspires and motivates teams',
                                  'Sets strategic direction',
                                  'Makes difficult decisions',
                                  'Leads by example',
                                  'Builds trust and respect'
                              ]
                          },
                          {
                              name: 'Strategic Planning',
                              weight: 25,
                              items: [
                                  'Develops regional strategy',
                                  'Aligns with company goals',
                                  'Identifies market opportunities',
                                  'Plans resource allocation',
                                  'Monitors strategic execution'
                              ]
                          },
                          {
                              name: 'Team Building',
                              weight: 25,
                              items: [
                                  'Recruits top talent',
                                  'Develops leadership pipeline',
                                  'Creates high-performing teams',
                                  'Manages team conflicts',
                                  'Retains key employees'
                              ]
                          },
                          {
                              name: 'Results Delivery',
                              weight: 20,
                              items: [
                                  'Achieves revenue targets',
                                  'Improves team performance',
                                  'Drives operational efficiency',
                                  'Manages budgets effectively',
                                  'Delivers on commitments'
                              ]
                          }
                      ]
                  },
                  SALES_DIRECTOR: {
                      name: 'Executive Leadership Evaluation',
                      description: 'Evaluates executive leadership and strategic vision',
                      categories: [
                          {
                              name: 'Strategic Vision',
                              weight: 30,
                              items: [
                                  'Develops long-term strategy',
                                  'Anticipates market trends',
                                  'Drives innovation',
                                  'Aligns organization',
                                  'Communicates vision clearly'
                              ]
                          },
                          {
                              name: 'Executive Leadership',
                              weight: 25,
                              items: [
                                  'Leads organizational change',
                                  'Builds executive relationships',
                                  'Represents company externally',
                                  'Makes high-stakes decisions',
                                  'Maintains board relationships'
                              ]
                          },
                          {
                              name: 'Business Results',
                              weight: 25,
                              items: [
                                  'Delivers revenue growth',
                                  'Improves profitability',
                                  'Expands market share',
                                  'Optimizes operations',
                                  'Drives shareholder value'
                              ]
                          },
                          {
                              name: 'Talent Development',
                              weight: 20,
                              items: [
                                  'Develops leadership team',
                                  'Succession planning',
                                  'Talent acquisition',
                                  'Performance management',
                                  'Culture building'
                              ]
                          }
                      ]
                  }
              };
              
              function loadScorecardTemplate() {
                  const scorecardType = document.getElementById('scorecardType').value;
                  const scorecardForm = document.getElementById('scorecardForm');
                  
                  if (!scorecardType) {
                      scorecardForm.style.display = 'none';
                      return;
                  }
                  
                  scorecardForm.style.display = 'block';
                  
                  if (scorecardType === 'CUSTOM') {
                      // Show empty form for custom scorecard
                      document.getElementById('scorecardName').value = '';
                      document.getElementById('scorecardDescription').value = '';
                      document.getElementById('categoriesList').innerHTML = '';
                      return;
                  }
                  
                  const template = scorecardTemplates[scorecardType];
                  if (template) {
                      document.getElementById('scorecardName').value = template.name;
                      document.getElementById('scorecardDescription').value = template.description;
                      renderCategories(template.categories);
                  }
              }
              
              function renderCategories(categories) {
                  const categoriesList = document.getElementById('categoriesList');
                  categoriesList.innerHTML = '';
                  
                  categories.forEach((category, index) => {
                      const categoryDiv = document.createElement('div');
                      categoryDiv.className = 'category-item';
                      categoryDiv.style.cssText = 'border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: #f9f9f9;';
                      
                      categoryDiv.innerHTML = \`
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                              <h4 style="margin: 0;">\${category.name}</h4>
                              <button type="button" class="btn btn-danger" onclick="removeCategory(\${index})" style="padding: 5px 10px; font-size: 12px;">Remove</button>
                          </div>
                          <div class="form-group">
                              <label>Category Name:</label>
                              <input type="text" value="\${category.name}" onchange="updateCategoryName(\${index}, this.value)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                          </div>
                          <div class="form-group">
                              <label>Weight (%):</label>
                              <input type="number" value="\${category.weight}" onchange="updateCategoryWeight(\${index}, this.value)" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                          </div>
                          <div class="form-group">
                              <label>Evaluation Items:</label>
                              <div id="items-\${index}"></div>
                              <button type="button" class="btn btn-secondary" onclick="addItem(\${index})" style="padding: 5px 10px; font-size: 12px; margin-top: 5px;">+ Add Item</button>
                          </div>
                      \`;
                      
                      categoriesList.appendChild(categoryDiv);
                      
                      // Render items for this category
                      renderItems(index, category.items);
                  });
              }
              
              function renderItems(categoryIndex, items) {
                  const itemsContainer = document.getElementById(\`items-\${categoryIndex}\`);
                  itemsContainer.innerHTML = '';
                  
                  items.forEach((item, itemIndex) => {
                      const itemDiv = document.createElement('div');
                      itemDiv.style.cssText = 'display: flex; align-items: center; margin: 5px 0;';
                      itemDiv.innerHTML = \`
                          <input type="text" value="\${item}" onchange="updateItem(\${categoryIndex}, \${itemIndex}, this.value)" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 3px; margin-right: 5px;">
                          <button type="button" class="btn btn-danger" onclick="removeItem(\${categoryIndex}, \${itemIndex})" style="padding: 4px 8px; font-size: 11px;">×</button>
                      \`;
                      itemsContainer.appendChild(itemDiv);
                  });
              }
              
              function addCategory() {
                  const categoriesList = document.getElementById('categoriesList');
                  const categoryIndex = categoriesList.children.length;
                  
                  const categoryDiv = document.createElement('div');
                  categoryDiv.className = 'category-item';
                  categoryDiv.style.cssText = 'border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: #f9f9f9;';
                  
                  categoryDiv.innerHTML = \`
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                          <h4 style="margin: 0;">New Category</h4>
                          <button type="button" class="btn btn-danger" onclick="removeCategory(\${categoryIndex})" style="padding: 5px 10px; font-size: 12px;">Remove</button>
                      </div>
                      <div class="form-group">
                          <label>Category Name:</label>
                          <input type="text" value="New Category" onchange="updateCategoryName(\${categoryIndex}, this.value)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                      </div>
                      <div class="form-group">
                          <label>Weight (%):</label>
                          <input type="number" value="25" onchange="updateCategoryWeight(\${categoryIndex}, this.value)" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                      </div>
                      <div class="form-group">
                          <label>Evaluation Items:</label>
                          <div id="items-\${categoryIndex}"></div>
                          <button type="button" class="btn btn-secondary" onclick="addItem(\${categoryIndex})" style="padding: 5px 10px; font-size: 12px; margin-top: 5px;">+ Add Item</button>
                      </div>
                  \`;
                  
                  categoriesList.appendChild(categoryDiv);
                  
                  // Add initial item
                  addItem(categoryIndex);
              }
              
              function addItem(categoryIndex) {
                  const itemsContainer = document.getElementById(\`items-\${categoryIndex}\`);
                  const itemIndex = itemsContainer.children.length;
                  
                  const itemDiv = document.createElement('div');
                  itemDiv.style.cssText = 'display: flex; align-items: center; margin: 5px 0;';
                  itemDiv.innerHTML = \`
                      <input type="text" value="New evaluation item" onchange="updateItem(\${categoryIndex}, \${itemIndex}, this.value)" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 3px; margin-right: 5px;">
                      <button type="button" class="btn btn-danger" onclick="removeItem(\${categoryIndex}, \${itemIndex})" style="padding: 4px 8px; font-size: 11px;">×</button>
                  \`;
                  itemsContainer.appendChild(itemDiv);
              }
              
              function removeCategory(index) {
                  const categoriesList = document.getElementById('categoriesList');
                  categoriesList.removeChild(categoriesList.children[index]);
              }
              
              function removeItem(categoryIndex, itemIndex) {
                  const itemsContainer = document.getElementById(\`items-\${categoryIndex}\`);
                  itemsContainer.removeChild(itemsContainer.children[itemIndex]);
              }
              
              function updateCategoryName(index, value) {
                  // Update category name in the UI
                  const categoryDiv = document.getElementById('categoriesList').children[index];
                  const title = categoryDiv.querySelector('h4');
                  title.textContent = value;
              }
              
              function updateCategoryWeight(index, value) {
                  // Category weight is already updated via the input field
              }
              
              function updateItem(categoryIndex, itemIndex, value) {
                  // Item value is already updated via the input field
              }
              
              function previewScorecard() {
                  const scorecardData = collectScorecardData();
                  if (!scorecardData) return;
                  
                  const preview = \`
                      <h3>Scorecard Preview: \${scorecardData.name}</h3>
                      <p><strong>Description:</strong> \${scorecardData.description}</p>
                      <p><strong>Type:</strong> \${document.getElementById('scorecardType').value}</p>
                      <h4>Categories:</h4>
                      <ul>
                          \${scorecardData.categories.map(cat => \`
                              <li>
                                  <strong>\${cat.name}</strong> (\${cat.weight}%)
                                  <ul>
                                      \${cat.items.map(item => \`<li>\${item}</li>\`).join('')}
                                  </ul>
                              </li>
                          \`).join('')}
                      </ul>
                  \`;
                  
                  showStatus('scorecardStatus', preview, 'success');
              }
              
              function collectScorecardData() {
                  const name = document.getElementById('scorecardName').value;
                  const description = document.getElementById('scorecardDescription').value;
                  const type = document.getElementById('scorecardType').value;
                  
                  if (!name || !description || !type) {
                      showStatus('scorecardStatus', 'Please fill in all required fields', 'error');
                      return null;
                  }
                  
                  const categories = [];
                  const categoriesList = document.getElementById('categoriesList');
                  
                  for (let i = 0; i < categoriesList.children.length; i++) {
                      const categoryDiv = categoriesList.children[i];
                      const nameInput = categoryDiv.querySelector('input[type="text"]');
                      const weightInput = categoryDiv.querySelector('input[type="number"]');
                      const itemsContainer = document.getElementById(\`items-\${i}\`);
                      
                      const items = [];
                      for (let j = 0; j < itemsContainer.children.length; j++) {
                          const itemInput = itemsContainer.children[j].querySelector('input[type="text"]');
                          if (itemInput && itemInput.value.trim()) {
                              items.push(itemInput.value.trim());
                          }
                      }
                      
                      if (nameInput.value.trim() && items.length > 0) {
                          categories.push({
                              name: nameInput.value.trim(),
                              weight: parseInt(weightInput.value) || 25,
                              items: items
                          });
                      }
                  }
                  
                  if (categories.length === 0) {
                      showStatus('scorecardStatus', 'Please add at least one category with items', 'error');
                      return null;
                  }
                  
                  return {
                      name,
                      description,
                      type,
                      categories
                  };
              }
              
              async function saveScorecard() {
                  const scorecardData = collectScorecardData();
                  if (!scorecardData) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/scorecards', {
                          method: 'POST',
                          headers: apiHeaders,
                          body: JSON.stringify(scorecardData)
                      });
                      
                      if (response.ok) {
                          showStatus('scorecardStatus', 'Scorecard saved successfully!', 'success');
                          loadExistingScorecards();
                      } else {
                          const error = await response.text();
                          showStatus('scorecardStatus', 'Error saving scorecard: ' + error, 'error');
                      }
                  } catch (error) {
                      showStatus('scorecardStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              async function loadExistingScorecards() {
                  try {
                      const response = await fetch(API_BASE + '/public-admin/scorecards', {
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          const scorecards = await response.json();
                          displayExistingScorecards(scorecards);
                      } else {
                          showStatus('scorecardStatus', 'Error loading scorecards', 'error');
                      }
                  } catch (error) {
                      showStatus('scorecardStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              function displayExistingScorecards(scorecards) {
                  const existingScorecards = document.getElementById('existingScorecards');
                  const scorecardsList = document.getElementById('scorecardsList');
                  
                  if (scorecards.length === 0) {
                      scorecardsList.innerHTML = '<p>No scorecards found.</p>';
                  } else {
                      scorecardsList.innerHTML = scorecards.map(scorecard => \`
                          <div class="user-item">
                              <div class="user-info">
                                  <strong>\${scorecard.name}</strong><br>
                                  <small>Type: \${scorecard.type} | Categories: \${scorecard.categories.length}</small><br>
                                  <small>\${scorecard.description}</small>
                              </div>
                              <div class="user-actions">
                                  <button class="btn btn-secondary" onclick="editScorecard('\${scorecard.id}')">Edit</button>
                                  <button class="btn btn-danger" onclick="deleteScorecard('\${scorecard.id}')">Delete</button>
                              </div>
                          </div>
                      \`).join('');
                  }
                  
                  existingScorecards.style.display = 'block';
              }
              
              async function editScorecard(scorecardId) {
                  try {
                      const response = await fetch(API_BASE + '/public-admin/scorecards/' + scorecardId, {
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          const scorecard = await response.json();
                          loadScorecardForEditing(scorecard);
                      } else {
                          showStatus('scorecardStatus', 'Error loading scorecard', 'error');
                      }
                  } catch (error) {
                      showStatus('scorecardStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              function loadScorecardForEditing(scorecard) {
                  document.getElementById('scorecardType').value = scorecard.type;
                  document.getElementById('scorecardName').value = scorecard.name;
                  document.getElementById('scorecardDescription').value = scorecard.description;
                  
                  document.getElementById('scorecardForm').style.display = 'block';
                  renderCategories(scorecard.categories);
              }
              
              async function deleteScorecard(scorecardId) {
                  if (!confirm('Are you sure you want to delete this scorecard?')) return;
                  
                  try {
                      const response = await fetch(API_BASE + '/public-admin/scorecards/' + scorecardId, {
                          method: 'DELETE',
                          headers: apiHeaders
                      });
                      
                      if (response.ok) {
                          showStatus('scorecardStatus', 'Scorecard deleted successfully!', 'success');
                          loadExistingScorecards();
                      } else {
                          showStatus('scorecardStatus', 'Error deleting scorecard', 'error');
                      }
                  } catch (error) {
                      showStatus('scorecardStatus', 'Error: ' + error.message, 'error');
                  }
              }
              
              // Load users on page load
              window.onload = function() {
                  loadUsers();
                  loadUsersForHierarchy();
              };
              
              // Load users for hierarchy dropdown
              async function loadUsersForHierarchy() {
                  try {
                      const response = await fetch(API_BASE + '/public-admin/users', {
                          headers: apiHeaders
                      });
                      if (response.ok) {
                          const users = await response.json();
                          const userSelect = document.getElementById('hierarchyUser');
                          userSelect.innerHTML = '<option value="">Select a user</option>';
                          
                          users.forEach(user => {
                              const option = document.createElement('option');
                              option.value = user.id;
                              option.textContent = user.displayName + ' (' + user.role + ')';
                              userSelect.appendChild(option);
                          });
                      }
                  } catch (error) {
                      console.error('Error loading users for hierarchy:', error);
                  }
              }
          </script>
      </body>
      </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error in getAdminPanel:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  @Get('team-manager')
  async getTeamManager(@Res() res: Response) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Team Manager - Sales Scorecard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .btn { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>👥 Team Manager</h1>
                <p>Manage teams and salespeople</p>
            </div>
            
            <div class="section">
                <h2>Team Management</h2>
                <p>Team management features coming soon...</p>
                <button class="btn" onclick="window.location.href='/public-admin/panel'">Back to Admin Panel</button>
            </div>
        </div>
    </body>
    </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('dashboard')
  async getDashboard() {
    const [
      totalRegions,
      totalTeams,
      totalSalespeople,
      totalUsers,
      totalEvaluations,
    ] = await Promise.all([
      this.seedService.getRegionsCount(),
      this.seedService.getTeamsCount(),
      this.seedService.getSalespeopleCount(),
      this.seedService.getUsersCount(),
      this.seedService.getEvaluationsCount(),
    ]);
    
    return {
      totalRegions,
      totalTeams,
      totalSalespeople,
      totalUsers,
      totalEvaluations,
    };
  }

  @Get('categories')
  async getCategories() {
    return this.scoringService.getCategories();
  }

  @Get('items')
  async getItems() {
    return this.scoringService.getItems();
  }

  @Post('seed/default')
  async seedDefaultStructure() {
    return this.seedService.seedDefaultScoringStructure();
  }

  @Post('seed/sample-data')
  async createSampleData() {
    return this.seedService.createSampleData();
  }

  @Post('create-organization')
  async createOrganization(@Body() body: any) {
    return this.seedService.createOrganizationStructure(body);
  }

  @Get('teams')
  async getTeams() {
    return this.seedService.getTeams();
  }

  @Get('teams/:id')
  async getTeamDetails(@Param('id') id: string) {
    return this.seedService.getTeamDetails(id);
  }

  @Post('teams/:id/members')
  async addTeamMember(@Param('id') id: string, @Body() body: { name: string; email: string; role: string }) {
    return this.seedService.addTeamMember(id, body);
  }

  @Delete('teams/:teamId/members/:memberId')
  async removeTeamMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string, @Query('type') type: string) {
    return this.seedService.removeTeamMember(teamId, memberId, type);
  }

  @Delete('teams/:id')
  async deleteTeam(@Param('id') id: string) {
    return this.seedService.deleteTeam(id);
  }

  @Delete('regions/:id')
  async deleteRegion(@Param('id') id: string) {
    return this.seedService.deleteRegion(id);
  }

  @Delete('delete-everything')
  async deleteEverything() {
    return this.seedService.deleteEverything();
  }

  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    try {
      const result = await this.authService.testEmail(body.email);
      return { success: true, message: 'Test email sent successfully', result };
    } catch (error) {
      return { 
        success: false, 
        message: 'Email test failed', 
        error: error.message,
        details: error
      };
    }
  }

  @Get('email-config')
  async getEmailConfig() {
    return {
      smtpHost: process.env.SMTP_HOST ? 'Set' : 'Not Set',
      smtpPort: process.env.SMTP_PORT ? 'Set' : 'Not Set',
      smtpUser: process.env.SMTP_USER ? 'Set' : 'Not Set',
      smtpPass: process.env.SMTP_PASS ? 'Set' : 'Not Set',
      smtpFrom: process.env.SMTP_FROM ? 'Set' : 'Not Set',
      allowedDomains: process.env.ALLOWED_DOMAINS ? 'Set' : 'Not Set',
      // Don't expose actual values for security
    };
  }

  @Get('pending-registrations')
  async getPendingRegistrations() {
    return this.seedService.getPendingRegistrations();
  }

  // Protected Admin Endpoints
  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  @UseGuards(AdminGuard)
  async createUser(@Body() userData: {
    email: string;
    displayName: string;
    role: string;
    password: string;
    isActive?: boolean;
  }) {
    return this.adminService.createUser(userData);
  }

  @Post('users/:id/reset-password')
  async resetUserPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.adminService.resetUserPassword(id, body.password);
  }

  @Post('create-admin')
  @UseGuards(AdminGuard)
  async createAdminUser(@Body() body: {
    email: string;
    displayName: string;
    password: string;
  }) {
    return this.adminService.createUser({
      email: body.email,
      displayName: body.displayName,
      role: 'ADMIN',
      password: body.password,
      isActive: true,
    });
  }

  // User hierarchy management endpoints (must come before users/:id route)
  @Post('users/:userId/assign-manager')
  @UseGuards(AdminGuard)
  async assignUserToManager(
    @Param('userId') userId: string,
    @Body() body: { managerId: string }
  ) {
    return this.adminService.assignUserToManager(userId, body.managerId);
  }

  @Delete('users/:userId/manager')
  @UseGuards(AdminGuard)
  async removeUserFromManager(@Param('userId') userId: string) {
    return this.adminService.removeUserFromManager(userId);
  }

  @Get('users/:userId/hierarchy')
  @UseGuards(AdminGuard)
  async getUserHierarchy(@Param('userId') userId: string) {
    return this.adminService.getUserHierarchy(userId);
  }

  @Get('users/:userId/available-managers')
  @UseGuards(AdminGuard)
  async getAvailableManagers(@Param('userId') userId: string) {
    return this.adminService.getAvailableManagers(userId);
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.adminService.getUserById(id);
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      await this.adminService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  @Get('health')
  async getHealth() {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      message: 'Sales Scorecard API is running'
    };
  }

  // Scorecard Management Endpoints
  @Get('scorecards')
  @UseGuards(AdminGuard)
  async getAllScorecards() {
    return this.adminService.getAllScorecards();
  }

  @Post('scorecards')
  @UseGuards(AdminGuard)
  async createScorecard(@Body() scorecardData: {
    name: string;
    description: string;
    type: string;
    categories: Array<{
      name: string;
      weight: number;
      items: string[];
    }>;
  }) {
    return this.adminService.createScorecard(scorecardData);
  }

  @Get('scorecards/:id')
  @UseGuards(AdminGuard)
  async getScorecardById(@Param('id') id: string) {
    return this.adminService.getScorecardById(id);
  }

  @Delete('scorecards/:id')
  @UseGuards(AdminGuard)
  async deleteScorecard(@Param('id') id: string) {
    return this.adminService.deleteScorecard(id);
  }
}
