import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import UserManagement from '@/components/Admin/UserManagement';
import ModelManagement from '@/components/Admin/ModelManagement';
import ResourceAllocation from '@/components/Admin/ResourceAllocation';
// Import other components...

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Your existing doctor/patient routes
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { 
        path: '', 
        element: <AdminDashboard /> 
      },
      { 
        path: 'users', 
        element: <UserManagement /> 
      },
      { 
        path: 'models', 
        element: <ModelManagement /> 
      },
      { 
        path: 'resources', 
        element: <ResourceAllocation /> 
      }
    ]
  }
]);

export default router; 