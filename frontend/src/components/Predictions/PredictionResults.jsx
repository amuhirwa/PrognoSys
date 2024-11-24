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
  Droplets,
  Calendar
} from 'lucide-react';
import { api } from "@/utils/axios";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PredictionResults = () => {
  const { testId } = useParams();
  const page = useSelector(state => state.sharedData.page);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('pending');
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [creatingTreatmentPlan, setCreatingTreatmentPlan] = useState(false);
  let queryUrl = '';
    
  useEffect(() => {
    fetchPredictionResults();
    fetchTreatmentPlan();
  }, [testId]);

  useEffect(() => {
    fetchTreatmentPlan();
  }, [prediction]);

  const fetchPredictionResults = async () => {
    try {
      setLoading(true);
      if (page === "list") {
        queryUrl = `predictions/${testId}`;
      } else {
        queryUrl = `test-results/${testId}/predictions/`;
      }
      const response = await api().get(queryUrl);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const highestConfidencePrediction = response.data.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        setPrediction(highestConfidencePrediction);
      } else {
        setPrediction(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch prediction results");
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentPlan = async () => {
    try {
      queryUrl = `predictions/${prediction.id}/treatment-plan/`;
      const response = await api().get(queryUrl);
      setTreatmentPlan(response.data);
    } catch (error) {
      console.log('No treatment plan found', error);
    }
  };

  const handleGeneratePrediction = async () => {
    try {
      setGenerating(true);
      const response = await api().post(`test-results/${testId}/predict/`);
      if (response.data.predictions && response.data.predictions.length > 0) {
        const highestConfidencePrediction = response.data.predictions.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        setPrediction(highestConfidencePrediction);
        toast.success("Prediction generated successfully")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate prediction")
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTreatmentPlan = async () => {
    try {
      setCreatingTreatmentPlan(true);
      const response = await api().post(`predictions/${prediction.id}/treatment-plan/`)
      setTreatmentPlan(response.data);
      if (response.status === 201) {
        navigate(`/treatment-recommendations/${prediction.id}`);
      }
    } catch (error) {
      toast.error("Failed to create treatment plan");
    } finally {
      setCreatingTreatmentPlan(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api().patch(`predictions/${prediction.id}/`, {
        status: newStatus
      });
      
      setPrediction(prev => ({
        ...prev,
        status: newStatus
      }));
      
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status")
    }
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
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-500" />
              AI Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!prediction || prediction.length === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">No prediction available for this test result.</p>
                <Button
                  onClick={handleGeneratePrediction}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                      Generating Prediction...
                    </>
                  ) : (
                    'Generate Prediction'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Prediction Results
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 inline-flex items-center cursor-pointer hover:bg-blue-200 transition-colors">
                          {prediction?.status ? 
                            prediction.status[0].toUpperCase() + prediction.status.slice(1) 
                            : 'Pending'}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
                          Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
                          Rejected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Predicted Condition</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {prediction?.condition || 'No prediction available'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Confidence Level</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${prediction?.confidence || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                          {prediction?.confidence || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Predicted on {prediction?.created_at || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Treatment Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-purple-500" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!treatmentPlan ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  No treatment plan has been created yet. Create one based on the prediction results.
                </p>
                <Button 
                  className="w-full"
                  onClick={handleCreateTreatmentPlan}
                  disabled={creatingTreatmentPlan}
                >
                  {creatingTreatmentPlan ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                      Creating Treatment Plan...
                    </>
                  ) : (
                    <>
                      Create Treatment Plan
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">
                    Treatment Summary
                  </h3>
                  <p className="text-purple-800">
                    {treatmentPlan.primary_recommendation.split(/\*\*(.*?)\*\*/).map((part, index) => 
                      index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                    )}
                  </p>
                </div>
                
                {treatmentPlan.steps && treatmentPlan.steps.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Treatment Steps</h3>
                    {treatmentPlan.steps.map((step, index) => (
                      <div 
                        key={index}
                        className="flex items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium mr-2">{index + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/treatments/${prediction.id}`)}
                >
                  Edit Treatment Plan
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
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
                <Droplets className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Blood Glucose</p>
                  <p className="font-semibold">{prediction?.vitals?.bloodGlucose || '--'} mg/dL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionResults; 