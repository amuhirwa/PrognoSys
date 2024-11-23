import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/utils/axios";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Download, Upload } from 'lucide-react';

const ModelManagement = () => {
  const [modelStats, setModelStats] = useState(null);
  const [retrainingStatus, setRetrainingStatus] = useState('idle');
  const { toast } = useToast();

  useEffect(() => {
    fetchModelStats();
  }, []);

  const fetchModelStats = async () => {
    try {
      const response = await api().get('admin/stats/');
      setModelStats(response.data.model_performance);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch model statistics",
        variant: "destructive",
      });
    }
  };

  const handleRetrainModel = async () => {
    try {
      setRetrainingStatus('training');
      await api().post('admin/model/retrain/');
      toast({
        title: "Success",
        description: "Model retraining initiated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate model retraining",
        variant: "destructive",
      });
    } finally {
      setRetrainingStatus('idle');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Model Management</h2>
          <p className="text-muted-foreground mt-1">Monitor and manage AI model performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Model
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Model
          </Button>
          <Button 
            onClick={handleRetrainModel}
            disabled={retrainingStatus === 'training'}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${retrainingStatus === 'training' ? 'animate-spin' : ''}`} />
            {retrainingStatus === 'training' ? 'Training...' : 'Retrain Model'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{modelStats?.accuracy || '0'}%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{modelStats?.total_predictions || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Predictions made to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">v{modelStats?.version || '1.0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Current active version</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Training History</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchModelStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Training Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add training history data here */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelManagement; 