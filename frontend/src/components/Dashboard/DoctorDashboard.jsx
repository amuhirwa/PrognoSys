import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  Clock,
  Activity,
  ArrowUpRight,
  FileText,
  Stethoscope,
  Brain,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/axios";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    total_patients: 0,
    new_patients: 0,
    success_rate: 0,
    total_predictions: 0
  });
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [predictionStats, setPredictionStats] = useState([]);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
      try {
        const response = await api().get('/dashboard-stats/');
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    // Fetch treatment plans
    const fetchTreatmentPlans = async () => {
      try {
        const response = await api().get('/treatment-plans/all/');
        setTreatmentPlans(response.data);
      } catch (error) {
        console.error('Error fetching treatment plans:', error);
      }
    };

    // Fetch prediction statistics
    const fetchPredictionStats = async () => {
      try {
        const response = await api().get('/predictions/stats/');
        // Format the data for the chart
        const formattedData = response.data.map(stat => ({
          date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          accuracy: parseFloat((stat.accuracy * 100).toFixed(1)),
          predictions: stat.total_predictions
        }));
        setPredictionStats(formattedData);
      } catch (error) {
        console.error('Error fetching prediction stats:', error);
      }
    };

    fetchDashboardStats();
    fetchTreatmentPlans();
    fetchPredictionStats();
  }, []);

  return (
    <div className="space-y-4 p-2 md:space-y-8 md:p-8 md:pt-6 max-w-full overflow-x-hidden">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {/* Total Patients Card */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardStats.total_patients}</div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +{dashboardStats.new_patients}
              </span>
              <span className="text-gray-500 ml-1">new patients</span>
            </p>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Brain className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.success_rate}%</div>
            <p className="text-sm text-gray-500 mt-1">
              Based on {dashboardStats.total_predictions} predictions
            </p>
          </CardContent>
        </Card>

        {/* Active Treatment Plans */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Treatment Plans</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatmentPlans.length}</div>
            <p className="text-sm text-gray-500 mt-1">Active plans</p>
          </CardContent>
        </Card>

        {/* Pending Diagnoses */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Diagnoses</CardTitle>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Stethoscope className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.pending_predictions}
            </div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Recent Treatment Plans */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-900">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              Recent Treatment Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {treatmentPlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{plan.patient_name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="inline-block h-2 w-2 rounded-full bg-purple-500 mr-2" />
                      {plan.condition}
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/treatments/${plan.prediction_id}`)}
                    className="bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors border-gray-200"
                  >
                    View Plan
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Chart */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                Prediction Success Rate
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                  <span className="text-gray-600">Accuracy</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-400 mr-2" />
                  <span className="text-gray-600">Predictions</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={predictionStats}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value}%`}
                    domain={[0, 100]}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'accuracy' ? `${value}%` : value,
                      name === 'accuracy' ? 'Accuracy' : 'Predictions'
                    ]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="predictions" 
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
