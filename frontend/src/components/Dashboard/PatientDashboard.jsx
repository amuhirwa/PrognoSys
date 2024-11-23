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

// Patient Dashboard
const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Health Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Dr. Smith</p>
                    <p className="text-sm text-gray-500">Tomorrow, 10:00 AM</p>
                  </div>
                  <Button size="sm">Reschedule</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Pill className="mr-2 h-5 w-5 text-green-500" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Medication #{i}</p>
                    <p className="text-sm text-gray-500">2 times daily</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Refill
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
