import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  MessageSquare,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

const AIRecommendations = () => {
  // This would come from your LLM API in a real implementation
  const mockAIRecommendations = {
    primaryRecommendation: "Based on the patient's test results and risk factors, a comprehensive diabetes management plan is recommended.",
    detailedPlan: [
      {
        category: "Medication",
        recommendations: [
          "Consider starting with Metformin 500mg twice daily",
          "Monitor blood glucose levels regularly",
          "Adjust dosage based on response after 2 weeks"
        ]
      },
      {
        category: "Lifestyle Changes",
        recommendations: [
          "Implement a low-glycemic diet plan",
          "30 minutes of moderate exercise 5 times per week",
          "Regular blood glucose monitoring"
        ]
      },
      {
        category: "Follow-up Care",
        recommendations: [
          "Schedule follow-up in 2 weeks",
          "Regular HbA1c monitoring every 3 months",
          "Annual eye examination"
        ]
      }
    ],
    warnings: [
      "Monitor for signs of hypoglycemia",
      "Patient has family history of cardiovascular disease"
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-500" />
          AI-Generated Treatment Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-800">
              {mockAIRecommendations.primaryRecommendation}
            </p>
          </div>

          {mockAIRecommendations.detailedPlan.map((plan) => (
            <div key={plan.category}>
              <h4 className="font-medium text-gray-900 mb-2">
                {plan.category}
              </h4>
              <ul className="space-y-2">
                {plan.recommendations.map((rec, index) => (
                  <li 
                    key={index}
                    className="flex items-start p-2 bg-gray-50 rounded-lg"
                  >
                    <ClipboardList className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Important Considerations
            </h4>
            <div className="space-y-2">
              {mockAIRecommendations.warnings.map((warning, index) => (
                <div 
                  key={index}
                  className="p-2 bg-red-50 text-red-800 rounded-lg"
                >
                  {warning}
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Request AI Clarification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations; 
