"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DynamicAnalyticsChart } from "@/components/dashboard/dynamic-analytics-chart"
import { DynamicCategoryChart } from "@/components/dashboard/dynamic-category-chart"
import { DynamicRadarChart } from "@/components/dashboard/dynamic-radar-chart"
import { DynamicPerformanceChart } from "@/components/dashboard/dynamic-performance-chart"
import { 
  experimentInsights
} from "@/lib/analytics-data"
import pb from "@/lib/pb"
import { useEffect, useState } from "react"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Download } from "lucide-react"

export default function AnalyticsPage() {
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<any>(null);
  const [sendingAnalytics, setSendingAnalytics] = useState(false);
  const [parsedAnalytics, setParsedAnalytics] = useState<any>(null);

  const totalParticipants = parsedAnalytics?.summary_statistics?.total_participants || 0;
  const activeExperiments = parsedAnalytics?.summary_statistics?.active_experiments || 0;
  const avgCompletionRate = parsedAnalytics?.summary_statistics?.avg_completion_rate || 0;
  const avgScore = parsedAnalytics?.summary_statistics?.avg_score || 0;

  // Fetch survey data from PocketBase
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        // Fetch data from the survey_data collection
        const records = await pb.collection('survey_data').getFullList({
          sort: '-created', // Sort by creation date, newest first
        });
        
        console.log('Survey Data:', records);
        setSurveyData(records);
        
        // Send survey data to analytics endpoint
        await sendSurveyDataToAnalytics(records);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, []);

  // Function to send survey data to analytics endpoint
  const sendSurveyDataToAnalytics = async (data: any[]) => {
    try {
      setSendingAnalytics(true);
      console.log('Sending survey data to analytics endpoint...');
      
      const response = await fetch('https://serverless-function-shbm.onrender.com/generate_analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: data,
          page: 1,
          perPage: 500,
          totalItems: data.length,
          totalPages: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analyticsResult = await response.json();
      console.log('Analytics Result:', analyticsResult);
      setAnalyticsResult(analyticsResult);
      
      // Parse the analytics data - new format doesn't need JSON extraction
      if (analyticsResult.success && analyticsResult.analytics) {
        console.log('Parsed Analytics Data:', analyticsResult.analytics);
        setParsedAnalytics(analyticsResult.analytics);
      }
      
    } catch (error) {
      console.error('Error sending data to analytics endpoint:', error);
      setAnalyticsResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setSendingAnalytics(false);
    }
  };

  // Function to export data as Excel with separate sheets per experiment
  const exportToExcel = () => {
    if (!surveyData || surveyData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Group data by experiment type
    const experimentGroups: { [key: string]: any[] } = {};
    
    surveyData.forEach((record) => {
      const experimentType = record.experiment_type || 'Unknown Experiment';
      if (!experimentGroups[experimentType]) {
        experimentGroups[experimentType] = [];
      }
      experimentGroups[experimentType].push(record);
    });

    // Create a sheet for each experiment type
    Object.keys(experimentGroups).forEach((experimentType, index) => {
      const data = experimentGroups[experimentType];
      
      // Prepare data for the sheet
      const sheetData = data.map(record => ({
        'Participant ID': record.id || '',
        'User ID': record.user_id || '',
        'Experiment Type': record.experiment_type || '',
        'Score': record.score || 0,
        'Completion Status': record.completion_status || '',
        'Time Taken (ms)': record.time_taken || 0,
        'Accuracy': record.accuracy || 0,
        'Questions Answered': record.questions_answered || 0,
        'Response Data': JSON.stringify(record.response_data || {}),
        'Session Data': JSON.stringify(record.session_data || {}),
        'Created Date': record.created ? new Date(record.created).toLocaleDateString() : '',
        'Updated Date': record.updated ? new Date(record.updated).toLocaleDateString() : ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(sheetData);
      
      // Auto-size columns
      const cols = Object.keys(sheetData[0] || {}).map(() => ({ wch: 15 }));
      ws['!cols'] = cols;

      // Create sheet name (max 31 characters for Excel)
      let sheetName = experimentType.substring(0, 31);
      if (sheetName.length === 31 && experimentType.length > 31) {
        sheetName = sheetName.substring(0, 28) + '...';
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Add summary sheet
    const summaryData = [
      {
        'Metric': 'Total Participants',
        'Value': totalParticipants
      },
      {
        'Metric': 'Active Experiments',
        'Value': activeExperiments
      },
      {
        'Metric': 'Average Completion Rate (%)',
        'Value': avgCompletionRate.toFixed(1)
      },
      {
        'Metric': 'Average Score',
        'Value': avgScore.toFixed(1)
      }
    ];

    if (parsedAnalytics?.category_distribution) {
      Object.entries(parsedAnalytics.category_distribution).forEach(([category, count]) => {
        summaryData.push({
          'Metric': `${category.replace('_', ' ').toUpperCase()} Experiments`,
          'Value': count as number
        });
      });
    }

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate Excel file and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(data, `experiment_analytics_${timestamp}.xlsx`);
  };

  return (
    <main className="grid gap-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button 
          onClick={exportToExcel} 
          disabled={loading || !surveyData.length}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalParticipants.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">All-time registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{activeExperiments}</div>
            <p className="text-sm text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{avgCompletionRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Completed experiments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{avgScore.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Across all experiments</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Cards - only show with real data */}
      {parsedAnalytics?.category_distribution && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-red-600">
                {parsedAnalytics.category_distribution.cognitive || 0}
              </div>
              <p className="text-sm text-muted-foreground">Experiments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Decision Making</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-blue-600">
                {parsedAnalytics.category_distribution.decision_making || 0}
              </div>
              <p className="text-sm text-muted-foreground">Experiments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Perception Reaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-green-600">
                {parsedAnalytics.category_distribution.perception_reaction || 0}
              </div>
              <p className="text-sm text-muted-foreground">Experiments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Social Emotional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-yellow-600">
                {parsedAnalytics.category_distribution.social_emotional || 0}
              </div>
              <p className="text-sm text-muted-foreground">Experiments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid gap-6">
        <DynamicAnalyticsChart data={parsedAnalytics} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <DynamicCategoryChart data={parsedAnalytics} />
          <DynamicPerformanceChart data={parsedAnalytics} />
        </div>
        
        <DynamicRadarChart data={parsedAnalytics} />
      </div>

      {/* Insights and Recommendations */}
      {parsedAnalytics?.insights_summary?.key_points && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {parsedAnalytics.insights_summary.key_points.map((insight: string, index: number) => (
                <div key={index} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback Insights if no real insights available */}
      {(!parsedAnalytics?.insights_summary?.key_points) && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {experimentInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                  insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                  insight.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-950'
                }`}>
                  <h4 className="font-semibold mb-2">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <p className="text-sm font-medium">{insight.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
