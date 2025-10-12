
# RailMadad - Comprehensive Railway Service Management Platform

A full-stack railway service management system that provides integrated solutions for train passengers including complaint management, food ordering, emergency services, feedback submission, and lost & found tracking. Features role-based dashboards for users, staff, and administrators with secure JWT authentication.

## 🎥 Demo Video

Watch our project demonstration to see all features in action:

[![RailMadad Demo](https://youtu.be/A5ZgRJDsmV0)](YOUR_VIDEO_LINK_HERE)

**[Click here to view the demo video](https://youtu.be/A5ZgRJDsmV0)**


## 🚂 Features

### Passenger Services
- **Complaint Management** - Register, track, and resolve railway service complaints
- **Food Ordering & Catering** - Order meals and beverages during train journeys
- **Emergency Services** - Quick access to emergency contacts, helplines, and SOS features
- **Feedback System** - Submit ratings and feedback about railway services
- **Lost and Found** - Report lost items and search for found belongings
- **News & Updates** - Stay informed about railway announcements and notifications

### Dashboard Access
- **User Dashboard** - Track complaints, orders, and feedback submissions
- **Staff Dashboard** - Manage user requests, complaints, and lost items
- **Admin Dashboard** - Comprehensive control panel with statistics and analytics

### Security Features
- JWT-based authentication with role-based authorization
- Secure user registration and login system
- Protected API endpoints with middleware authentication

## 📁 Project Structure

```
VERSION-2.0/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── admincontroller.js
│   │   ├── cateringcontroller.js
│   │   ├── complaintController.js
│   │   ├── emergencyController.js
│   │   ├── feedbackController.js
│   │   ├── foodcontroller.js
│   │   ├── lostnfoundController.js
│   │   ├── newsController.js
│   │   ├── staffcontroller.js
│   │   └── usercontroller.js
│   ├── middlewares/
│   │   ├── adminAuthentication.js
│   │   ├── staffAuthentication.js
│   │   └── userAuthentication.js
│   ├── models/
│   ├── routes/
│   ├── node_modules/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── admin-news.html
│   ├── admindashboard.html
│   ├── adminfeedback.html
│   ├── adminlogin.html
│   ├── adminregister.html
│   ├── cateringlogin.html
│   ├── complaint.css
│   └── [other HTML/CSS/JS files]
└── README.md
```

## 👥 Team Members & Contributions

| Name | Roll Number | Responsibilities |
|------|-------------|------------------|
| **Purval** | S20230010193 | Food Management and Catering System |
| **Vedant** | S20230010118 | Complaint Management, User Dashboard, Admin Panel, News |
| **Yash** | S20230010141 | JWT Authentication, Staff Dashboard, Lost and Found |
| **Vineet** | S20230010260 | Admin Dashboard, Statistics, and Styling |
| **Shirley** | S20230010223 | Emergency Services and Feedback |

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- VSCode Live Server

### Backend
- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- Cloudinary (Image storage)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- Git
- VSCode (with Live Server extension)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Railway-Madad/Version-2.0.git
cd Version-2.0
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory and add the following variables:

```env
# MongoDB Configuration
MONGO_URL=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
node index.js
```

The server should now be running on `http://localhost:5000`

### 4. Frontend Setup

1. Open the `frontend` folder in VSCode
2. Right-click on `index.html` (or any HTML file)
3. Select "Open with Live Server"
4. The application will open in your default browser

## 📱 Usage Guide

### User Registration & Login
1. Navigate to the registration page on the frontend
2. Fill in the required details (name, email, password, etc.)
3. Submit the form to create your account
4. Login with your credentials to access the dashboard

### Accessing Different Portals

#### User Portal
- Register complaints about train services
- Order food and beverages
- Access emergency services
- Submit feedback
- Report lost items

#### Staff Portal
- Login through staff authentication
- View and manage user complaints
- Process food orders
- Update lost and found records
- Respond to emergency requests

#### Admin Portal
- Login through admin authentication (`adminlogin.html`)
- Access comprehensive dashboard with statistics
- Manage news and announcements
- View all feedback submissions
- Oversee all system operations

## 🔐 Authentication Flow

The application implements role-based authentication:

1. **User Authentication** (`userAuthentication.js`)
   - Handles user login and token generation
   - Protects user-specific routes

2. **Staff Authentication** (`staffAuthentication.js`)
   - Validates staff credentials
   - Provides access to staff dashboard

3. **Admin Authentication** (`adminAuthentication.js`)
   - Secures admin panel access
   - Validates admin tokens for protected operations

## 🎯 API Architecture

### Controllers
- `admincontroller.js` - Admin operations and statistics
- `cateringcontroller.js` - Food catering management
- `complaintController.js` - Complaint handling logic
- `emergencyController.js` - Emergency service operations
- `feedbackController.js` - Feedback collection and management
- `foodcontroller.js` - Food ordering system
- `lostnfoundController.js` - Lost and found management
- `newsController.js` - News and announcements
- `staffcontroller.js` - Staff operations
- `usercontroller.js` - User management and authentication

## 🔮 Future Enhancements

### Technical Improvements
- [ ] Real-time notifications using Socket.io
- [ ] Progressive Web App (PWA) for offline access
- [ ] Redis caching for improved performance
- [ ] API rate limiting and request throttling
- [ ] Comprehensive logging system

### Feature Additions
- [ ] Mobile application (React Native/Flutter)
- [ ] Multi-language support (Hindi, English, Regional languages)
- [ ] AI-powered chatbot for instant query resolution
- [ ] Integration with IRCTC PNR system
- [ ] Payment gateway integration (Razorpay/Paytm)
- [ ] GPS tracking for lost items
- [ ] QR code-based food ordering
- [ ] Voice-based complaint registration
- [ ] Email/SMS notifications for complaint status updates

### User Experience
- [ ] Advanced search and filter options
- [ ] Rating system for food and services
- [ ] Export reports in PDF/Excel format
- [ ] Two-factor authentication (2FA)
- [ ] Social media integration for sharing
- [ ] Dark mode theme
- [ ] Accessibility features (WCAG compliance)

### Analytics & Reporting
- [ ] Data visualization with Chart.js/D3.js
- [ ] Complaint resolution time tracking
- [ ] User satisfaction metrics
- [ ] Monthly/Annual reports generation
- [ ] Predictive analytics for complaint patterns

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify all environment variables are set correctly

**Frontend not loading:**
- Make sure backend is running first
- Check browser console for errors
- Ensure Live Server extension is installed

**Authentication errors:**
- Verify JWT_SECRET is configured
- Check if tokens are being stored correctly
- Clear browser cache and cookies

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For any queries or issues:
- Open an issue on GitHub
- Contact the development team
- Check documentation for common solutions

## 🙏 Acknowledgments

- Indian Railways for inspiration
- All team members for their dedicated contributions
- Open-source community for the amazing tools and libraries
- MongoDB for database solutions
- Cloudinary for image storage services

## 📊 Project Status

**Current Version:** 2.0  
**Status:** Active Development  
**Last Updated:** 2025

---

