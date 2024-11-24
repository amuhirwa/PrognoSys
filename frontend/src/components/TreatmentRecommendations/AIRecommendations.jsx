import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, ClipboardList, AlertCircle } from "lucide-react";
import { api } from "@/utils/axios";

const AIRecommendations = () => {
  const { predictionId } = useParams();
  const [treatmentPlan, setTreatmentPlan] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTreatmentPlan = async () => {
      try {
        const { data } = await api().get(
          `/predictions/${predictionId}/treatment-plan/`
        );
        setTreatmentPlan(data);
      } catch (error) {
        console.error("Error fetching treatment plan:", error);
        // You might want to add error state handling here
      } finally {
        setIsLoading(false);
      }
    };

    if (predictionId) {
      fetchTreatmentPlan();
    }
  }, [predictionId]);

  const parseDetailedPlan = (plans) => {
    const result = [];
    
    plans.forEach(plan => {
      // First handle the category section
      let cleanCategory = plan.category.replace(/\*\*/g, "").trim();
      const categoryMatch = cleanCategory.match(/(\d+\.) *(.*)/);
      
      if (categoryMatch) {
        const [, numberPart, content] = categoryMatch;
        const [titlePart, ...contentParts] = content.split(":");
        
        if (titlePart) {
          const remainingContent = contentParts.join(":");
          result.push({
            category: `${numberPart} ${titlePart.trim()}`,
            recommendations: remainingContent ? [remainingContent.trim()] : []
          });
        }
      }
      
      // Then handle any numbered sections in recommendations
      plan.recommendations.forEach(rec => {
        const cleanRec = rec.replace(/\*\*/g, "").trim();
        const recMatch = cleanRec.match(/(\d+\.) *(.*)/);
        
        if (recMatch) {
          const [, numberPart, content] = recMatch;
          const [titlePart, ...contentParts] = content.split(":");
          
          if (titlePart) {
            const remainingContent = contentParts.join(":");
            // Split remaining content into sentences
            const sentences = remainingContent
              .split(/\.(?!\d)(?!\s*[a-z])/)
              .map(s => s.trim())
              .filter(Boolean);
              
            result.push({
              category: `${numberPart} ${titlePart.trim()}`,
              recommendations: sentences
            });
          }
        }
      });
    });
    
    // Sort by the number at the start of the category
    return result
      .sort((a, b) => {
        const aNum = parseInt(a.category);
        const bNum = parseInt(b.category);
        return aNum - bNum;
      })
      .filter(item => 
        !item.category.toLowerCase().includes("warning") &&
        !item.category.toLowerCase().includes("disclaimer")
      );
  };

  const parseWarningsAndDisclaimers = (plans) => {
    const warningItems = [];

    plans.forEach((plan) => {
      const fullText = plan.category + " " + plan.recommendations.join(" ");
      const sentences = fullText.split(".");

      sentences.forEach((sentence) => {
        const cleanSentence = sentence.replace(/\*\*/g, "").trim();
        if (
          cleanSentence &&
          (cleanSentence.toLowerCase().includes("warning") ||
            cleanSentence.toLowerCase().includes("disclaimer") ||
            cleanSentence.toLowerCase().includes("seek immediate"))
        ) {
          warningItems.push(cleanSentence);
        }
      });
    });

    return warningItems;
  };

  if (isLoading) return <div>Loading...</div>;
  if (!treatmentPlan) return <div>No treatment plan available</div>;

  const parsedDetailedPlan = parseDetailedPlan(treatmentPlan.detailed_plan);
  const parsedWarnings = parseWarningsAndDisclaimers(
    treatmentPlan.detailed_plan
  );

  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
        <CardTitle className="text-xl flex items-center">
          <Brain className="mr-3 h-6 w-6 text-purple-600" />
          AI-Generated Treatment Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Primary Recommendation Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              Primary Recommendation
            </h3>
            <p className="text-purple-800 leading-relaxed">
              {treatmentPlan.primary_recommendation
                .split(/\*\*(.*?)\*\*/)
                .map((part, index) =>
                  index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                )}{" "}
            </p>
          </div>

          {/* Detailed Plans Section */}
          <div className="space-y-8">
            {parsedDetailedPlan.map((plan, index) => (
              <div key={index} className="bg-white rounded-xl border shadow-sm">
                <h4 className="font-semibold text-gray-900 p-4 border-b bg-gray-50">
                  {plan.category}
                </h4>
                <ul className="p-4 space-y-3">
                  {plan.recommendations.map((rec, recIndex) => (
                    <li
                      key={recIndex}
                      className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ClipboardList className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Warnings Section */}
          {parsedWarnings.length > 0 && (
            <div className="rounded-xl border border-red-200 overflow-hidden">
              <h4 className="font-semibold text-gray-900 p-4 border-b bg-red-50 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Important Considerations
              </h4>
              <div className="p-4 space-y-3">
                {parsedWarnings.map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-100 flex items-start"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Clarification Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl transition-colors"
              size="lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Request AI Clarification
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
