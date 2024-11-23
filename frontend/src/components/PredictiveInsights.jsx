import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Activity,
  Heart,
  Clock,
  AlertTriangle,
  Clipboard,
  ChevronRight,
  Plus,
  BarChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';

// Mock data
const vitalHistory = [
  { date: 'Jan', heartRate: 75, bloodPressure: 120, temperature: 98.6 },
  { date: 'Feb', heartRate: 72, bloodPressure: 118, temperature: 98.4 },
  { date: 'Mar', heartRate: 78, bloodPressure: 122, temperature: 98.7 },
  { date: 'Apr', heartRate: 73, bloodPressure: 119, temperature: 98.5 },
  { date: 'May', heartRate: 76, bloodPressure: 121, temperature: 98.8 },
];

const riskFactors = [
  { factor: 'Diabetes', risk: 75 },
  { factor: 'Heart Disease', risk: 45 },
  { factor: 'Hypertension', risk: 60 },
  { factor: 'Obesity', risk: 30 },
];


export default function PredictiveInsights() {
    return (
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={riskFactors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="factor" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="risk" fill="#fbbf24" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-purple-500" />
                Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Blood Pressure', 'Cholesterol', 'Blood Sugar'].map((metric) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{metric}</span>
                      <span className="text-sm text-gray-500">Trending Up</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '70%' }} />
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