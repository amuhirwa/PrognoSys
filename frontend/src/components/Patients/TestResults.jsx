import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  ArrowLeft,
  Activity,
  Heart,
  Droplet,
  Scale,
  Thermometer,
  Syringe,
  Gauge,
  ChevronDown,
  Ruler
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/utils/axios';
import { HeartPulse } from 'lucide-react';
import { LucideHeartPulse } from 'lucide-react';

const TestResults = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState({
    glucose: '80',
    bloodPressure: '120',
    skinThickness: '20',
    insulin: '100',
    bmi: '25',
    cholesterol: '180',
    fastingBS: 'N',
    restingECG: 'Normal',
    maxHR: '150',
    exerciseAngina: 'N',
    chestPainType: 'TA'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setTestResults({
      ...testResults,
      [e.target.name]: e.target.value,
    });
  };

  const fieldLabels = {
    glucose: 'Glucose Level',
    bloodPressure: 'Blood Pressure',
    skinThickness: 'Skin Thickness',
    insulin: 'Insulin Level',
    bmi: 'BMI',
    cholesterol: 'Cholesterol',
    maxHR: 'Max Heart Rate',
    chestPainType: 'Chest Pain Type',
    restingECG: 'Resting ECG',
    fastingBS: 'Fasting Blood Sugar',
    exerciseAngina: 'Exercise Angina'
  };

  const validationRules = {
    glucose: { required: true, min: 0, max: 1000 },
    bloodPressure: { required: true, min: 60, max: 250 },
    skinThickness: { required: true, min: 0, max: 100 },
    insulin: { required: true, min: 0, max: 1000 },
    bmi: { required: true, min: 10, max: 100 },
    cholesterol: { required: true, min: 0, max: 1000 },
    maxHR: { required: true, min: 60, max: 202 },
    chestPainType: { required: true },
    restingECG: { required: true }
  };

  const generatePrediction = async () => {
    // Validate all fields
    let hasErrors = false;
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const value = testResults[field];
      const rules = validationRules[field];

      if (rules.required && !value) {
        newErrors[field] = `${fieldLabels[field]} is required`;
        hasErrors = true;
      } else if (value && rules.min !== undefined && Number(value) < rules.min) {
        newErrors[field] = `${fieldLabels[field]} must be at least ${rules.min}`;
        hasErrors = true;
      } else if (value && rules.max !== undefined && Number(value) > rules.max) {
        newErrors[field] = `${fieldLabels[field]} must be less than ${rules.max}`;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    console.log(newErrors, errors)
    
    if (hasErrors) {
      return;
    }

    try {
      await api().post(`/patient/${patientId}/submit-test-results/`, testResults);
      toast.success("Test results submitted successfully");
      navigate(`/patient/${patientId}/prediction`);
    } catch (error) {
      toast.error("Failed to generate prediction");
    }
  };

  const inputFields = [
    { name: 'glucose', label: 'Glucose Level', icon: Droplet, unit: 'mg/dL' },
    { name: 'bloodPressure', label: 'Resting Blood Pressure', icon: Activity, unit: 'mm Hg' },
    { name: 'skinThickness', label: 'Skin Thickness', icon: Ruler, unit: 'mm' },
    { name: 'insulin', label: 'Insulin Level', icon: Syringe, unit: 'μU/mL' },
    { name: 'bmi', label: 'BMI', icon: Scale, unit: 'kg/m²' },
    { name: 'cholesterol', label: 'Serum Cholesterol', icon: Gauge, unit: 'mm/dl' },
    { name: 'maxHR', label: 'Maximum Heart Rate', icon: Heart, unit: 'bpm' },
  ];

  const renderInput = ({ name, label, icon: Icon, unit }) => (
    <div key={name} className="relative space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${errors[name] ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <Input
          id={name}
          name={name}
          type="number"
          value={testResults[name]}
          onChange={handleInputChange}
          className={`pl-10 pr-12 h-11 ${
            errors[name] 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="0"
          required
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className={`text-sm font-medium ${errors[name] ? 'text-red-500' : 'text-gray-500'}`}>
            {unit}
          </span>
        </div>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const renderChestPainSelect = () => (
    <div className="relative space-y-2">
      <label htmlFor="chestPainType" className="block text-sm font-semibold text-gray-700">
        Chest Pain Type <span className="text-red-500">*</span>
      </label>
      <div className="relative border rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Heart className={`h-5 w-5 ${errors.chestPainType ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <select
          id="chestPainType"
          name="chestPainType"
          value={testResults.chestPainType}
          onChange={handleInputChange}
          className={`w-full h-11 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 ${
            errors.chestPainType
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          } bg-white`}
          style={{ appearance: 'none' }}
          required
        >
          <option value="">Select type</option>
          <option value="TA">Typical Angina</option>
          <option value="ATA">Atypical Angina</option>
          <option value="NAP">Non-Anginal Pain</option>
          <option value="ASY">Asymptomatic</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 ${errors.chestPainType ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
      </div>
      {errors.chestPainType && (
        <p className="text-red-500 text-sm mt-1">{errors.chestPainType}</p>
      )}
    </div>
  );

  const renderRestingECGSelect = () => (
    <div className="relative space-y-2">
      <label htmlFor="restingECG" className="block text-sm font-semibold text-gray-700">
        Resting ECG Results <span className="text-red-500">*</span>
      </label>
      <div className="relative border rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LucideHeartPulse className={`h-5 w-5 ${errors.restingECG ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <select
          id="restingECG"
          name="restingECG"
          value={testResults.restingECG}
          onChange={handleInputChange}
          className={`w-full h-11 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 ${
            errors.restingECG
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          } bg-white`}
          style={{ appearance: 'none' }}
          required
        >
          <option value="">Select ECG result</option>
          <option value="Normal">Normal</option>
          <option value="ST">ST-T Wave Abnormality</option>
          <option value="LVH">Left Ventricular Hypertrophy</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 ${errors.restingECG ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
      </div>
      {errors.restingECG && (
        <p className="text-red-500 text-sm mt-1">{errors.restingECG}</p>
      )}
    </div>
  );

  const renderExerciseAnginaSelect = () => (
    <div className="relative space-y-2">
      <label htmlFor="exerciseAngina" className="block text-sm font-semibold text-gray-700">
        Exercise-Induced Angina <span className="text-red-500">*</span>
      </label>
      <div className="relative border rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Heart className={`h-5 w-5 ${errors.exerciseAngina ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <select
          id="exerciseAngina"
          name="exerciseAngina"
          value={testResults.exerciseAngina}
          onChange={handleInputChange}
          className={`w-full h-11 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 ${
            errors.exerciseAngina
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          } bg-white`}
          style={{ appearance: 'none' }}
          required
        >
          <option value="">Select option</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 ${errors.exerciseAngina ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
      </div>
      {errors.exerciseAngina && (
        <p className="text-red-500 text-sm mt-1">{errors.exerciseAngina}</p>
      )}
    </div>
  );

  const renderFastingBSSelect = () => (
    <div className="relative space-y-2">
      <label htmlFor="fastingBS" className="block text-sm font-semibold text-gray-700">
        Fasting Blood Sugar &gt; 120 mg/dl <span className="text-red-500">*</span>
      </label>
      <div className="relative border rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Droplet className={`h-5 w-5 ${errors.fastingBS ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <select
          id="fastingBS"
          name="fastingBS"
          value={testResults.fastingBS}
          onChange={handleInputChange}
          className={`w-full h-11 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 ${
            errors.fastingBS
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          } bg-white`}
          style={{ appearance: 'none' }}
          required
        >
          <option value="">Select option</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 ${errors.fastingBS ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
      </div>
      {errors.fastingBS && (
        <p className="text-red-500 text-sm mt-1">{errors.fastingBS}</p>
      )}
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center text-gray-800">
                <BarChart className="mr-2 h-6 w-6 text-blue-500" />
                Patient Test Results
              </CardTitle>
              <Button
                onClick={() => navigate(`/patient/${patientId}`)}
                variant="ghost"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map(renderInput)}
              {renderChestPainSelect()}
              {renderRestingECGSelect()}
              {renderExerciseAnginaSelect()}
              {renderFastingBSSelect()}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <Button 
                onClick={generatePrediction} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Generate Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResults;
