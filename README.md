# Prognosys - Healthcare Management System

**Prognosys** is a comprehensive healthcare management system designed to assist medical professionals in managing patients, rooms, and AI-powered medical predictions. The platform offers robust features like real-time notifications, role-based access control, and much more.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [User Management](#user-management)
  - [Room Management](#room-management)
  - [Medical Predictions](#medical-predictions)
  - [Notifications](#notifications)
- [API Documentation](#api-documentation)
- [Common Issues & Solutions](#common-issues--solutions)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

---

## Overview

Prognosys simplifies healthcare management with features such as:
- **Patient Management**
- **Room Booking and Management**
- **AI-powered Medical Predictions**
- **Real-time Notifications**
- **User Settings and Preferences**
- **Role-based Access Control (Admin, Doctor)**

---

## Prerequisites

Ensure the following tools are installed:
- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**
- **Git**

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/amuhirwa/PrognoSys.git
cd PrognoSys
```
### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
npm run dev
```
###Environment Variables
Backend
Create a .env file in the backend directory with the following variables:

```makefile
GEMINI_API_KEY=YOUR_API_KEY
```
Frontend
Create a .env file in the frontend directory with the following variables:

```bash
VITE_API_URL=http://localhost:8000/api
```
# Project Structure

The project is organized as follows:
- **Backend**: Django Rest Framework (API and business logic)
- **Frontend**: React + Vite (User Interface)
- **Shared**: Shared assets and configurations

---

## Key Features

### User Management
- Role-based authentication (Admin, Doctor, Patient)
- Profile management
- Custom settings and preferences

### Room Management
- Room booking system
- Real-time room status updates
- Equipment tracking
- Room type categorization

### Medical Predictions
- AI-powered disease prediction
- Treatment recommendations
- Patient history tracking

### Notifications
- Real-time updates
- Email notifications
- Custom notification preferences

---

## API Documentation

The backend provides RESTful APIs for:

### Authentication
- Login/Logout
- Password reset
- Token refresh

### User Management
- Profile CRUD operations
- Settings management

### Room Management
- Room booking
- Status updates
- Equipment management

### Medical Services
- Predictions
- Treatment plans
- Patient records

---

## Common Issues & Solutions

### CORS Issues
- Ensure CORS settings are properly configured in Django settings.
- Check if the frontend URL matches `CORS_ALLOWED_ORIGINS`.

### Database Migrations
Run the following commands:
```bash
python manage.py makemigrations
python manage.py migrate
```
If issues persist:

Delete migrations and db.sqlite3.
Re-run migrations.

## JWT Token Issues

- Clear browser storage.
- Ensure token refresh functionality is working.
- Check token expiration settings in your configuration.

---

## Contributing

1. Fork the repository.
2. Create your feature branch:
```bash
   git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m "Add some AmazingFeature"
```
4. Push to the branch:
``bash
git push origin feature/AmazingFeature
```

Open a pull request.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Support
For support, please open an issue in the GitHub repository or contact the development team.

Acknowledgments
Django Rest Framework
React + Vite
Shadcn UI
Google Gemini AI
