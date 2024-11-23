import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Activity, Heart, Clock, 
  AlertTriangle, Clipboard, ChevronRight, 
  Plus, BarChart, ArrowRight, ArrowLeft,
  Calendar, Phone, Mail, User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from "@/utils/axios";
import { toast } from "react-hot-toast";
import { useToast } from "@/hooks/use-toast";

// Mock data
const vitalHistory = [
  { date: 'Jan', heartRate: 75, bloodPressure: 120, temperature: 98.6 },
  { date: 'Feb', heartRate: 72, bloodPressure: 118, temperature: 98.4 },
  { date: 'Mar', heartRate: 78, bloodPressure: 122, temperature: 98.7 },
  { date: 'Apr', heartRate: 73, bloodPressure: 119, temperature: 98.5 },
  { date: 'May', heartRate: 76, bloodPressure: 121, temperature: 98.8 },
];

const PatientRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log(patientId);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleNotification = async (message, type = "default") => {
    toast({
      title: type === "error" ? "Error" : "Success",
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for patient:', patientId);
      const response = await api().get(`patient/${patientId}/`);
      setPatientData(response.data);
      handleNotification("Patient data loaded successfully");
    } catch (error) {
      handleNotification("Failed to fetch patient data", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setTestResults({
      ...testResults,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestResultSubmit = async () => {
    try {
      const response = await api().post(`patient/${patientId}/test-results/`, testResults);
      handleNotification("Test results submitted successfully");
      setTestResults({
        heartRate: '',
        bloodPressure: '',
        temperature: '',
      });
    } catch (error) {
      handleNotification("Failed to submit test results", "error");
      console.error(error);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Record</h1>
          <p className="text-gray-500">Manage patient information and medical history</p>
        </div>
        <Button
          onClick={() => navigate('/patients')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Overview Card - Spans 2 columns */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                {loading ? 'Loading...' : patientData?.name || 'Patient Information'}
              </CardTitle>
              <Button variant="outline" className="text-blue-500 hover:text-blue-600">
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Age</span>
                  </div>
                  <p className="font-semibold">{patientData?.age || 'N/A'} years</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Emergency Contact</span>
                  </div>
                  <p className="font-semibold">{patientData?.emergency_contact || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Last Visit</span>
                  </div>
                  <p className="font-semibold">
                    {patientData?.created_at ? new Date(patientData.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button 
              onClick={() => navigate(`/patient/${patientId}/test-results`)}
              className="w-full justify-start text-left"
              variant="outline"
            >
              <Activity className="mr-2 h-4 w-4 text-blue-500" />
              New Test Results
            </Button>
            <Button className="w-full justify-start text-left" variant="outline">
              <FileText className="mr-2 h-4 w-4 text-green-500" />
              View Medical History
            </Button>
            <Button className="w-full justify-start text-left" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
              Report Emergency
            </Button>
          </CardContent>
        </Card>

        {/* Vital Signs Chart */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Vital Signs History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-gray-500" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {['Lab Results', 'Prescription History', 'Medical History'].map((doc) => (
                <div 
                  key={doc}
                  onClick={() => doc === 'Lab Results' ? navigate(`/patient/${patientId}/test-results-list`) : null}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{doc}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientRecords;
