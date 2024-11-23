import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import StatCard from './StatCard';
import ProjectList from './ProjectList';
import NotificationPanel from './NotificationPanel';
import Chart from './Chart';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/overview/');
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="date-picker">
          {/* Add date picker component here */}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`$${dashboardData?.stats?.total_revenue}`}
          icon={<FiDollarSign />}
          trend={+2.5}
          color="blue"
        />
        <StatCard
          title="Total Sales"
          value={dashboardData?.stats?.total_sales}
          icon={<FiShoppingBag />}
          trend={+1.7}
          color="green"
        />
        <StatCard
          title="Total Purchases"
          value={dashboardData?.stats?.total_purchases}
          icon={<FiUsers />}
          trend={-0.8}
          color="red"
        />
        <StatCard
          title="Growth"
          value={`${dashboardData?.stats?.total_growth}%`}
          icon={<FiTrendingUp />}
          trend={+4.2}
          color="purple"
        />
      </div>

      <div className="dashboard-grid">
        <div className="chart-section">
          <Chart data={dashboardData?.chartData} />
        </div>
        <div className="projects-section">
          <ProjectList projects={dashboardData?.recent_projects} />
        </div>
        <div className="notifications-section">
          <NotificationPanel notifications={dashboardData?.notifications} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 