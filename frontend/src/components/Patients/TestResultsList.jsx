import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Activity,
  Heart,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/utils/axios';
import { toast } from 'react-hot-toast';

const TestResultsList = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTestResults();
  }, [patientId]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await api().get(`/patient/${patientId}/test-results/`);
      setTestResults(response.data);
    } catch (error) {
      toast.error("Failed to fetch test results");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = testResults.filter(result => 
    result.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
            <p className="text-gray-500">View all test results and lab reports</p>
          </div>
          <Button
            onClick={() => navigate(`/patient/${patientId}`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Patient
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by date..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </CardContent>
            </Card>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">Test Results</h3>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {result.date}
                        </span>
                      </div>       
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Blood Pressure: {result.blood_pressure} mmHg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">
                            Max HR: {result.max_hr} bpm
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            Glucose: {result.glucose} mg/dL
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/patient/${patientId}/prediction/${result.id}`)}
                      variant="ghost"
                      className="flex items-center"
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
                <p className="text-gray-500">No test results found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultsList;
