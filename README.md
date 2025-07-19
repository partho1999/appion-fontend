# Appion - Medical Appointment Management System

A modern, full-stack medical appointment management system built with Next.js, featuring role-based access control for patients, doctors, and administrators.

## 🚀 Features

### For Patients
- **User Registration & Authentication**: Secure login/register system
- **Book Appointments**: Schedule appointments with available doctors
- **View My Appointments**: Track appointment history and status
- **Cancel Appointments**: Cancel pending appointments
- **Profile Management**: Update personal information

### For Doctors
- **Schedule Management**: Set available timeslots and consultation fees
- **Patient Appointments**: View and manage patient appointments
- **Appointment Status Updates**: Confirm, complete, or decline appointments
- **Statistics Dashboard**: View earnings, patient count, and appointment metrics
- **Profile Management**: Update professional information

### For Administrators
- **Patient Management**: View and manage all patient accounts
- **Doctor Management**: Oversee doctor accounts and schedules
- **Appointment Oversight**: Monitor all appointments across the system
- **Reports Generation**: Download monthly and doctor-specific reports
- **System Statistics**: Access comprehensive system analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Authentication**: JWT tokens with localStorage
- **Backend**: RESTful API (FastAPI/Python)
- **Database**: PostgreSQL (assumed)

## 📁 Project Structure

```
appion-fontend/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # Dashboard pages
│   │   ├── appointments/         # Appointment management
│   │   ├── doctors/             # Doctor-specific pages
│   │   ├── patients/            # Patient management (admin)
│   │   ├── reports/             # Reports generation (admin)
│   │   ├── schedule/            # Doctor schedule management
│   │   └── statistics/          # Doctor statistics
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.js                  # Landing page
├── components/                   # Reusable components
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # Dashboard components
│   ├── appointments/            # Appointment components
│   ├── doctors/                 # Doctor-related components
│   ├── profile/                 # Profile components
│   └── ui/                      # UI components (shadcn/ui)
├── contexts/                    # React contexts
│   └── auth-context.jsx         # Authentication context
├── hooks/                       # Custom hooks
├── lib/                         # Utility functions
├── public/                      # Static assets
└── styles/                      # Additional styles
```

## 🔐 User Roles & Permissions

### Patient Role
- **Access**: `/dashboard/appointments`, `/dashboard/profile`
- **Actions**: Book appointments, view/cancel own appointments
- **Restrictions**: Cannot access doctor or admin features

### Doctor Role
- **Access**: `/dashboard/appointments`, `/dashboard/schedule`, `/dashboard/statistics`, `/dashboard/profile`
- **Actions**: Manage appointments, update schedule, view statistics
- **Restrictions**: Cannot access admin features

### Admin Role
- **Access**: All dashboard pages including `/dashboard/patients`, `/dashboard/reports`
- **Actions**: Full system access, manage users, generate reports
- **Restrictions**: None

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appion-fontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001`

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/user/profile` - Get user profile

### Appointments
- `GET /api/v1/appointments` - Get patient appointments
- `GET /api/v1/doctors/appointments` - Get doctor appointments
- `GET /api/v1/admin/appointments` - Get all appointments (admin)
- `POST /api/v1/appointments` - Book appointment
- `PATCH /api/v1/appointments/{id}/status` - Update appointment status
- `DELETE /api/v1/appointments/{id}` - Cancel appointment

### Doctor Management
- `GET /api/v1/doctors/{id}/schedule` - Get doctor schedule
- `PUT /api/v1/doctors/schedule` - Update doctor schedule
- `GET /api/v1/doctors/statistics` - Get doctor statistics

### Admin Features
- `GET /api/v1/admin/patients` - Get all patients
- `GET /api/v1/admin/doctors` - Get all doctors
- `GET /api/v1/admin/reports/monthly` - Monthly reports
- `GET /api/v1/admin/reports/doctor/{id}` - Doctor-specific reports

## 📊 Key Features Explained

### Appointment System
- **Booking Flow**: Patients can select doctors, choose time slots, and book appointments
- **Status Management**: Appointments have states (pending, confirmed, completed, cancelled)
- **Role-based Views**: Different interfaces for patients, doctors, and admins

### Schedule Management
- **Doctor Schedules**: Doctors can set available timeslots and consultation fees
- **Dynamic Updates**: Real-time schedule updates with proper validation
- **Flexible Format**: Supports comma-separated time ranges

### Reporting System
- **Monthly Reports**: Comprehensive monthly statistics with CSV export
- **Doctor Reports**: Individual doctor performance reports
- **CSV Generation**: Automatic JSON-to-CSV conversion for data analysis

### User Management
- **Role-based Access**: Secure access control based on user roles
- **Profile Management**: Users can update their information
- **Admin Oversight**: Administrators can manage all user accounts

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional medical application design
- **Loading States**: Proper loading indicators and error handling
- **Toast Notifications**: User-friendly success/error messages
- **Form Validation**: Client-side validation with proper error display

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Configuration
- **Base URL**: `http://localhost:8000`
- **Authentication**: Bearer token in Authorization header
- **Content Type**: JSON for requests, CSV for downloads

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
- Ensure backend API is accessible
- Configure CORS settings on backend
- Set up proper environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review API endpoints
- Ensure backend is running
- Verify user authentication

---

**Built with ❤️ for modern healthcare management** 