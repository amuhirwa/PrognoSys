import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  Pill,
  Calendar,
  ClipboardList,
  ArrowLeft,
  Check,
  Search,
  Clock,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { api } from "@/utils/axios";
import { useToast } from "@/hooks/use-toast";

const TreatmentRecommendations = () => {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    fetchTreatments();
  }, []);

  useEffect(() => {
    if (predictionId) {
      fetchTreatmentDetails(predictionId);
    }
  }, [predictionId]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await api().get('treatment-plans/all/');
      setTreatments(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch treatments")
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await api().get(`treatment-plans/${id}/`);
      setSelectedTreatment(response.data);
      setDoctorNotes(response.data.doctor_notes || '');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch treatment details")
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTreatmentPlan = async () => {
    try {
      await api().post(`treatment-plans/${predictionId}/`, {
        doctorNotes,
        ...selectedTreatment
      });
      toast.success("Treatment plan saved successfully")
      navigate('/treatment-recommendations');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save treatment plan")
    }
  };

  const filteredTreatments = treatments.filter(treatment => 
    treatment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.primary_treatment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // If no treatment is selected, show the list view
  if (!selectedTreatment) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="text-gray-500">View and manage all treatment recommendations</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or treatment..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredTreatments.length > 0 ? (
            filteredTreatments.map((treatment) => (
              <Card key={treatment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">
                          Treatment Plan for {treatment.patient_name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(treatment.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Last updated: {new Date(treatment.updated_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Primary Treatment:</span>
                        <span className="text-sm text-gray-600">
                          {treatment.primary_treatment?.substring(0, 100)}...
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/treatments/${treatment.prediction_id}`)}
                    >
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center">
                <p className="text-gray-500">No treatment plans found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Treatment details view
  return (
    <div className="flex-1 p-8 bg-gray-50">
      <Button 
        onClick={() => {
          setSelectedTreatment(null);
          navigate('/treatment-recommendations');
        }} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Treatment Plans
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Stethoscope className="mr-2 h-5 w-5 text-blue-500" />
              Treatment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold">Primary Treatment</h3>
                <p className="text-blue-700 mt-2">
                  {selectedTreatment?.primary_treatment || 'No treatment specified'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Treatment Goals</h3>
                {selectedTreatment?.goals?.map((goal, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Pill className="mr-2 h-5 w-5 text-purple-500" />
              Recommended Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTreatment?.medications?.map((med, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg space-y-2"
                >
                  <h4 className="font-semibold">{med.name}</h4>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                  <p className="text-sm text-gray-500">{med.frequency}</p>
                  {med.notes && (
                    <p className="text-sm text-gray-500 mt-2">{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Follow-up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTreatment?.follow_up_schedule?.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-semibold">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Doctor's Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-orange-500" />
              Doctor's Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add your notes about the treatment plan..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="lg:col-span-2 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => {
            setSelectedTreatment(null);
            navigate('/treatment-recommendations');
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveTreatmentPlan}>
            Save Treatment Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentRecommendations;