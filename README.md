# IT Equipment and Asset Management Dashboard

Modern, user-friendly and comprehensive IT equipment management system.

## 🚀 Features

### 📋 Employee Management
- Add, edit and delete employees
- Department and position tracking
- Contact information management
- Data protection with soft delete

### 💻 Equipment Management
- **Supported Categories:**
  - Laptop Computer
  - Desktop Computer
  - Mobile Phone
  - Desk Phone
  - Tablet
  - Monitor
  - Other

- **Dynamic Fields:**
  - Category-specific information fields
  - MAC address, CPU, GPU, RAM, storage information
  - Accessory management (maximum 10 items)
  - Serial number tracking

### 🤝 Assignment System
- Employee-equipment matching
- Assignment and return operations
- Assignment history tracking
- Automatic status updates

### 📊 History and Reporting
- System audit logs
- Equipment history
- Employee history
- Detailed operation records

### 🎨 User Interface
- **Responsive Design:** Mobile compatible
- **Theme Support:** Light/dark theme
- **Modern UI:** Bootstrap 5 + Font Awesome
- **User Friendly:** Intuitive navigation

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **RESTful API** - API design

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Modern styles
- **JavaScript (ES6+)** - Vanilla JS
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons

## 📦 Installation

### Requirements
- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)

### Steps

1. **Clone the project:**
```bash
git clone https://github.com/BelongUnity/IT_Dashboard.git
cd IT_Dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```

4. **Open in browser:**
```
http://localhost:3002
```

## 🚀 System Startup

### Automatic Startup (Recommended)
```cmd
start.bat
```
- ✅ Backend startup
- ✅ Firewall settings (administrator privileges required)
- ✅ Database backup
- ✅ System status check
- ✅ Network access information

### Manual Startup
```bash
npm start
```

### System Shutdown
Close the backend window or press `Ctrl+C`.

## 🔐 Security and Access

### Admin Login
- **Username:** `admin`
- **Password:** `admin`
- **Session Duration:** 10 minutes (automatic logout after inactivity)

### Network Access
- **Local:** `http://localhost:3002`
- **Network:** `http://[YOUR_IP]:3002`
- **Port:** 3002 (automatically opened in firewall)

## 🚀 Usage

### Initial Setup
1. SQLite database is automatically created when server starts
2. Required tables and indexes are automatically installed
3. Use `http://localhost:3002` to access the dashboard

### Basic Operations

#### Adding Employee
1. Go to "Employees" tab
2. Fill out the form in the left panel
3. Click "Save" button

#### Adding Equipment
1. Go to "Equipment" tab
2. Select category (fields update automatically)
3. Fill in required information
4. Add accessories (optional)
5. Click "Save" button

#### Assignment
1. Go to "Assignments" tab
2. Select employee and equipment
3. Add notes (optional)
4. Click "Assign" button

#### Return
1. Click "Return" button in active assignment list
2. Select return reason
3. Add notes (optional)
4. Click "Return" button

## 📁 Project Structure

```
IT_Dashboard/
├── server.js                 # Main server file
├── package.json              # NPM configuration
├── inventory.db              # SQLite database (auto-created)
├── api/                      # Backend API
│   ├── routes/               # API routes
│   │   ├── employees.js      # Employee routes
│   │   ├── equipment.js      # Equipment routes
│   │   ├── assignments.js    # Assignment routes
│   │   ├── history.js        # History routes
│   │   └── accessories.js    # Accessory routes
│   ├── controllers/          # Business logic
│   │   ├── employeeController.js
│   │   ├── equipmentController.js
│   │   ├── assignmentController.js
│   │   ├── historyController.js
│   │   └── accessoryController.js
│   ├── models/               # Data models
│   │   ├── Employee.js
│   │   ├── Equipment.js
│   │   ├── Assignment.js
│   │   ├── AuditLog.js
│   │   └── Accessory.js
│   ├── services/             # Service layer
│   │   ├── auditService.js
│   │   └── validationService.js
│   ├── utils/                # Helper functions
│   │   ├── database.js       # Database connection
│   │   ├── constants.js      # Constants
│   │   └── helpers.js        # Helper functions
│   └── middleware/           # Middleware
│       ├── auth.js
│       ├── validation.js
│       └── errorHandler.js
├── public/                   # Frontend files
│   ├── index.html            # Main HTML page
│   ├── style.css             # CSS styles
│   └── script.js             # JavaScript code
└── README.md                 # This file
```

## 🔧 API Endpoints

### Employees
- `GET /api/employees` - List all active employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft delete)
- `GET /api/employees/stats/departments` - Department statistics

### Equipment
- `GET /api/equipment` - List all active equipment
- `POST /api/equipment` - Add new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment (soft delete)
- `GET /api/equipment/category/:category` - Equipment by category
- `GET /api/equipment/status/:status` - Equipment by status
- `GET /api/equipment/available/list` - Available equipment
- `PATCH /api/equipment/:id/status` - Update equipment status

### Accessories
- `GET /api/equipment/:id/accessories` - List equipment accessories
- `POST /api/equipment/:id/accessories` - Add accessory to equipment
- `POST /api/equipment/:id/accessories/bulk` - Bulk add accessories
- `PUT /api/accessories/:id` - Update accessory
- `DELETE /api/accessories/:id` - Delete accessory

### Assignments
- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create new assignment
- `POST /api/assignments/:id/return` - Return assignment
- `PUT /api/assignments/:id` - Update assignment
- `GET /api/assignments/active/list` - Active assignments
- `GET /api/assignments/employee/:id` - Employee assignments
- `GET /api/assignments/equipment/:id` - Equipment assignments

### History
- `GET /api/history/system` - System history
- `GET /api/history/table/:table` - Table history
- `GET /api/history/equipment/:id` - Equipment history
- `GET /api/history/employee/:id` - Employee history
- `GET /api/history/date-range` - Date range history
- `GET /api/history/action/:action` - Action type history

## 🔒 Security

- **SQL Injection Protection:** Parametrized queries
- **Input Validation:** Client and server-side
- **CORS Settings:** Secure cross-origin requests
- **Rate Limiting:** API request limiting
- **Soft Delete:** Data loss protection

## 📊 Performance

- **Singleton Database Connection:** Efficient database usage
- **Optimized Queries:** Indexed queries
- **Client-side Caching:** Fast data access
- **Responsive Loading:** User experience

## 🎯 Future Improvements

### Short Term (v2.1)
- [ ] QR code support
- [ ] Excel export/import
- [ ] Advanced filtering
- [ ] Bulk operations

### Medium Term (v2.5)
- [ ] User login and authorization
- [ ] Email notifications
- [ ] Reporting dashboard
- [ ] API rate limiting

### Long Term (v3.0)
- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-tenant support

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- Make sure port 3002 is not in use
- Check Node.js version (v14+ required)

**Database error:**
- Check write permissions for `inventory.db` file
- Make sure SQLite3 package is correctly installed

**API errors:**
- Check error messages in browser console
- Examine API requests in Network tab

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📞 Contact

- **Project:** IT Equipment and Asset Management Dashboard
- **Version:** 2.0.0
- **Developer:** AI Assistant
- **Date:** 2024

---

**Note:** This system is designed for development environment. Additional security measures should be taken for production use.