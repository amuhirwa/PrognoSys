import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Search,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from "@/utils/axios";
import { useDispatch } from 'react-redux';
import { changepage } from '@/utils/SharedData';
import { toast } from 'react-hot-toast';

const PredictionsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await api().get('predictions/');
      setPredictions(response.data);
    } catch (error) {
      toast.error("Failed to fetch predictions");
    } finally {
      setLoading(false);
    }
    console.log(predictions);
  };

  const getStatusColor = (confidence) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredPredictions = predictions.filter(pred => 
    pred.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pred.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Predictions & Diagnoses</h1>
        <p className="text-gray-500">View and manage all AI predictions and diagnoses</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name or condition..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((prediction) => (
            <Card key={prediction.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-lg">{prediction.condition}</h3>
                      <span className={`flex items-center ${getStatusColor(prediction.confidence)}`}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(prediction.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(prediction.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Patient:</span>
                      <span className="text-sm text-gray-600">{prediction.patient_name}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {dispatch(changepage("list")); navigate(`/predictions/${prediction.id}`)}}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => navigate(`/treatments/${prediction.id}`)}
                    >
                      Treatment Plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center space-y-3">
              <p className="text-gray-500 text-center">No predictions found. Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PredictionsList; 