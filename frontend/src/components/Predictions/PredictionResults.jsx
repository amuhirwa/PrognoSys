import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  AlertTriangle,
  ClipboardList,
  ArrowLeft,
  ChevronRight,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react';
import { api } from "@/utils/axios";
import { useToast } from "@/hooks/use-toast";

const PredictionResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictionResults();
  }, [testId]);

  const fetchPredictionResults = async () => {
    try {
      setLoading(true);
      const response = await api().get(`predictions/${testId}/`);
      setPrediction(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch prediction results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTreatmentPlan = () => {
    navigate(`/treatment-recommendations/${testId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Test Results
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-500" />
              AI Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Predicted Condition
                </h3>
                <p className="text-blue-700">
                  {prediction?.condition || 'No prediction available'}
                </p>
                <div className="mt-2 flex items-center">
                  <div className="text-sm text-blue-600">
                    Confidence: {prediction?.confidence || 0}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Risk Factors</h3>
                {prediction?.riskFactors?.map((factor, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{factor.factor}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      factor.severity === 'High' ? 'bg-red-100 text-red-700' :
                      factor.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {factor.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Heart Rate</p>
                  <p className="font-semibold">{prediction?.vitals?.heartRate || '--'} BPM</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Blood Pressure</p>
                  <p className="font-semibold">{prediction?.vitals?.bloodPressure || '--'} mmHg</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Thermometer className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="font-semibold">{prediction?.vitals?.temperature || '--'}°F</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Tests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-purple-500" />
              Recommended Additional Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction?.additionalTests?.map((test, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>{test}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Based on the prediction results, we recommend creating a treatment plan
                for the patient.
              </p>
              <Button 
                className="w-full"
                onClick={handleCreateTreatmentPlan}
              >
                Create Treatment Plan
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionResults; 