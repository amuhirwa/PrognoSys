import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Activity,
  Heart,
  Droplet,
  Scale,
  Thermometer,
  Syringe,
  Gauge,
  Calendar,
  Clock,
  LucideHeartPulse,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/utils/axios';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { changepage } from '@/utils/SharedData';

const TestResultDetails = () => {
  const { patientId, testId } = useParams();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTestResult();
  }, [testId]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      const response = await api().get(`/patient/${patientId}/test-results/${testId}/`);
      setTestResult(response.data);
    } catch (error) {
      toast.error("Failed to fetch test result details");
      navigate(`/patient/${patientId}/test-results-list`);
    } finally {
      setLoading(false);
    }
  };

  const getChestPainTypeLabel = (code) => {
    const types = {
      'TA': 'Typical Angina',
      'ATA': 'Atypical Angina',
      'NAP': 'Non-Anginal Pain',
      'ASY': 'Asymptomatic'
    };
    return types[code] || code;
  };

  const metrics = testResult ? [
    { label: 'Glucose Level', value: `${testResult.glucose} mg/dL`, icon: Droplet },
    { label: 'Blood Pressure', value: `${testResult.blood_pressure} mm Hg`, icon: Activity },
    { label: 'Skin Thickness', value: `${testResult.skin_thickness} mm`, icon: Scale },
    { label: 'Insulin Level', value: `${testResult.insulin} μU/mL`, icon: Syringe },
    { label: 'BMI', value: `${testResult.bmi} kg/m²`, icon: Scale },
    { label: 'Cholesterol', value: `${testResult.cholesterol} mm/dl`, icon: Gauge },
    { label: 'Max Heart Rate', value: `${testResult.max_hr} bpm`, icon: Heart },
    { label: 'Chest Pain Type', value: getChestPainTypeLabel(testResult.chest_pain_type), icon: AlertCircle },
    { label: 'Resting ECG', value: testResult.resting_ecg, icon: LucideHeartPulse },
    { label: 'Exercise Angina', value: testResult.exercise_angina === 'Y' ? 'Yes' : 'No', icon: Heart },
    { label: 'Fasting Blood Sugar', value: testResult.fasting_bs === 'Y' ? '> 120 mg/dl' : '≤ 120 mg/dl', icon: Droplet },
  ] : [];

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Result Details</h1>
            <p className="text-gray-500">Detailed view of test results and measurements</p>
          </div>
          <Button
            onClick={() => navigate(`/patient/${patientId}/test-results-list`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Results
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Test Results</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {testResult?.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {testResult?.time}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {dispatch(changepage("Test")); navigate(`/predictions/${testResult?.id}`)}}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Prediction
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{label}</p>
                      <p className="text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResultDetails; 