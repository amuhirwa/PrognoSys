import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Settings,
  User,
  BarChart3,
  Activity,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  Heart,
  Clock,
  Pill,
  Clipboard,
  Hospital,
  UserCog,
  Database,
  Shield,
  ArrowUpRight,
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
import NavBar from "../NavBar";

const healthData = [
  { name: "Jan", value: 98 },
  { name: "Feb", value: 95 },
  { name: "Mar", value: 97 },
  { name: "Apr", value: 96 },
  { name: "May", value: 98 },
  { name: "Jun", value: 97 },
];
const arr = []
const DoctorDashboard = () => {
  return (
    <div className="space-y-4 p-2 md:space-y-8 md:p-8 md:pt-6 max-w-full overflow-x-hidden">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">2,543</div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +180
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +2.81%
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* High Risk Patients */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-900">
              <div className="p-2 bg-red-50 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              High Risk Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">Patient #{i}</p>
                    <div className="flex items-center text-sm text-red-500">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2" />
                      Critical Condition
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-gray-200"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-900">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">Patient #{i}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      10:00 AM
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-gray-200"
                  >
                    Start Session
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Success Chart */}
        <Card className="md:col-span-2 bg-white border-none hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-900">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              Treatment Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[200px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={healthData} 
                  margin={{ 
                    top: 5, 
                    right: 5, 
                    left: 0, 
                    bottom: 5 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }} 
                  />
                  <YAxis 
                    stroke="#888888"
                    tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                    activeDot={{ r: window.innerWidth < 768 ? 4 : 6, strokeWidth: 2 }}
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
