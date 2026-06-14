// Analytics data for behavioral experiments dashboard
export interface AnalyticsData {
  success: boolean;
  analytics: {
    overview: {
      totalParticipants: number;
      avgCompletionRate: number;
      avgScore: number;
      categoryBreakdown: {
        cognitive: number;
        decision_making: number;
        perception_reaction: number;
        social_emotional: number;
      };
    };
    charts: {
      performanceByCategory: ChartData;
      metricsRadar: ChartData;
      trendsLine: ChartData;
    };
  };
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
}

export interface ExperimentResult {
  id: string;
  name: string;
  category: 'cognitive' | 'decision-making' | 'perception-reaction' | 'social-emotional';
  status: 'active' | 'completed' | 'paused' | 'draft';
  participants: number;
  completion_rate: number;
  avg_score: number;
  created_at: string;
  duration_days: number;
  metrics?: {
    reaction_time?: number;
    accuracy?: number;
    engagement?: number;
    retention?: number;
  };
}

export interface PerformanceMetrics {
  month: string;
  experiments: number;
  participants: number;
  conversions: number;
  revenue: number;
  completion_rate: number;
  avg_score: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  avg_performance: number;
  fill: string;
}

export interface ParticipantEngagement {
  date: string;
  new_participants: number;
  returning_participants: number;
  active_sessions: number;
  avg_session_duration: number;
}

export interface ScoreDistribution {
  score_range: string;
  count: number;
  percentage: number;
}

export interface ExperimentRadarData {
  metric: string;
  cognitive: number;
  decision_making: number;
  perception_reaction: number;
  social_emotional: number;
  fullMark: number;
}

export interface TopParticipant {
  id: string;
  name: string;
  email: string;
  total_experiments: number;
  avg_score: number;
  completion_rate: number;
  last_active: string;
  badge?: string;
}

// Dummy experiment results data
export const experimentResults: ExperimentResult[] = [
  {
    id: 'exp-001',
    name: 'Stroop Color-Word Test',
    category: 'cognitive',
    status: 'active',
    participants: 256,
    completion_rate: 87.3,
    avg_score: 78.5,
    created_at: '2024-01-15',
    duration_days: 30,
    metrics: {
      reaction_time: 542,
      accuracy: 85.2,
      engagement: 92.1,
      retention: 78.4
    }
  },
  {
    id: 'exp-002',
    name: 'N-Back Memory Task',
    category: 'cognitive',
    status: 'completed',
    participants: 189,
    completion_rate: 92.1,
    avg_score: 82.3,
    created_at: '2024-02-01',
    duration_days: 21,
    metrics: {
      reaction_time: 678,
      accuracy: 79.8,
      engagement: 88.7,
      retention: 85.2
    }
  },
  {
    id: 'exp-003',
    name: 'Investment Choice Simulation',
    category: 'decision-making',
    status: 'active',
    participants: 342,
    completion_rate: 76.8,
    avg_score: 71.2,
    created_at: '2024-02-10',
    duration_days: 45,
    metrics: {
      reaction_time: 2340,
      accuracy: 68.9,
      engagement: 84.3,
      retention: 72.1
    }
  },
  {
    id: 'exp-004',
    name: 'Risk Assessment Game',
    category: 'decision-making',
    status: 'completed',
    participants: 198,
    completion_rate: 88.4,
    avg_score: 75.6,
    created_at: '2024-01-20',
    duration_days: 28,
    metrics: {
      reaction_time: 1890,
      accuracy: 73.4,
      engagement: 89.2,
      retention: 81.7
    }
  },
  {
    id: 'exp-005',
    name: 'Visual Reaction Time Test',
    category: 'perception-reaction',
    status: 'active',
    participants: 445,
    completion_rate: 94.2,
    avg_score: 86.7,
    created_at: '2024-03-01',
    duration_days: 14,
    metrics: {
      reaction_time: 298,
      accuracy: 91.3,
      engagement: 96.4,
      retention: 89.1
    }
  },
  {
    id: 'exp-006',
    name: 'Motion Detection Task',
    category: 'perception-reaction',
    status: 'paused',
    participants: 167,
    completion_rate: 82.6,
    avg_score: 79.4,
    created_at: '2024-02-28',
    duration_days: 18,
    metrics: {
      reaction_time: 423,
      accuracy: 87.1,
      engagement: 85.3,
      retention: 76.8
    }
  },
  {
    id: 'exp-007',
    name: 'Empathy Response Study',
    category: 'social-emotional',
    status: 'active',
    participants: 298,
    completion_rate: 79.5,
    avg_score: 73.8,
    created_at: '2024-02-15',
    duration_days: 35,
    metrics: {
      reaction_time: 1567,
      accuracy: 76.2,
      engagement: 81.9,
      retention: 74.3
    }
  },
  {
    id: 'exp-008',
    name: 'Social Conformity Test',
    category: 'social-emotional',
    status: 'completed',
    participants: 223,
    completion_rate: 85.7,
    avg_score: 77.1,
    created_at: '2024-01-10',
    duration_days: 42,
    metrics: {
      reaction_time: 2120,
      accuracy: 74.6,
      engagement: 87.4,
      retention: 79.8
    }
  },
  {
    id: 'exp-009',
    name: 'Working Memory Span',
    category: 'cognitive',
    status: 'draft',
    participants: 0,
    completion_rate: 0,
    avg_score: 0,
    created_at: '2024-03-10',
    duration_days: 0,
    metrics: {
      reaction_time: 0,
      accuracy: 0,
      engagement: 0,
      retention: 0
    }
  },
  {
    id: 'exp-010',
    name: 'Attention Switching Task',
    category: 'cognitive',
    status: 'active',
    participants: 156,
    completion_rate: 91.0,
    avg_score: 80.2,
    created_at: '2024-03-05',
    duration_days: 12,
    metrics: {
      reaction_time: 612,
      accuracy: 82.7,
      engagement: 93.5,
      retention: 86.3
    }
  }
];

// Monthly performance metrics for line charts
export const performanceMetrics: PerformanceMetrics[] = [
  {
    month: 'Jan',
    experiments: 8,
    participants: 1250,
    conversions: 987,
    revenue: 12400,
    completion_rate: 78.9,
    avg_score: 75.2
  },
  {
    month: 'Feb',
    experiments: 12,
    participants: 1680,
    conversions: 1425,
    revenue: 17800,
    completion_rate: 84.8,
    avg_score: 79.1
  },
  {
    month: 'Mar',
    experiments: 10,
    participants: 1890,
    conversions: 1623,
    revenue: 19200,
    completion_rate: 85.9,
    avg_score: 81.4
  },
  {
    month: 'Apr',
    experiments: 15,
    participants: 2340,
    conversions: 2012,
    revenue: 24600,
    completion_rate: 86.0,
    avg_score: 82.7
  },
  {
    month: 'May',
    experiments: 18,
    participants: 2780,
    conversions: 2456,
    revenue: 29400,
    completion_rate: 88.3,
    avg_score: 84.2
  },
  {
    month: 'Jun',
    experiments: 14,
    participants: 2145,
    conversions: 1934,
    revenue: 23800,
    completion_rate: 90.2,
    avg_score: 85.6
  },
  {
    month: 'Jul',
    experiments: 16,
    participants: 2567,
    conversions: 2398,
    revenue: 28900,
    completion_rate: 93.4,
    avg_score: 87.1
  },
  {
    month: 'Aug',
    experiments: 20,
    participants: 3120,
    conversions: 2934,
    revenue: 35600,
    completion_rate: 94.0,
    avg_score: 88.3
  },
  {
    month: 'Sep',
    experiments: 22,
    participants: 3456,
    conversions: 3298,
    revenue: 39200,
    completion_rate: 95.4,
    avg_score: 89.7
  },
  {
    month: 'Oct',
    experiments: 19,
    participants: 2987,
    conversions: 2876,
    revenue: 34100,
    completion_rate: 96.3,
    avg_score: 90.2
  },
  {
    month: 'Nov',
    experiments: 17,
    participants: 2654,
    conversions: 2567,
    revenue: 31800,
    completion_rate: 96.7,
    avg_score: 90.8
  },
  {
    month: 'Dec',
    experiments: 21,
    participants: 3234,
    conversions: 3145,
    revenue: 38700,
    completion_rate: 97.2,
    avg_score: 91.4
  }
];

// Category distribution for pie charts
export const categoryDistribution: CategoryDistribution[] = [
  {
    category: 'Cognitive',
    count: 45,
    percentage: 35.2,
    avg_performance: 82.4,
    fill: '#ef4444'
  },
  {
    category: 'Decision Making',
    count: 32,
    percentage: 25.0,
    avg_performance: 74.8,
    fill: '#3b82f6'
  },
  {
    category: 'Perception Reaction',
    count: 28,
    percentage: 21.9,
    avg_performance: 88.1,
    fill: '#10b981'
  },
  {
    category: 'Social Emotional',
    count: 23,
    percentage: 18.0,
    avg_performance: 76.3,
    fill: '#f59e0b'
  }
];

// Participant engagement data for area charts
export const participantEngagement: ParticipantEngagement[] = [
  {
    date: '2024-01-01',
    new_participants: 45,
    returning_participants: 123,
    active_sessions: 168,
    avg_session_duration: 18.5
  },
  {
    date: '2024-01-08',
    new_participants: 52,
    returning_participants: 134,
    active_sessions: 186,
    avg_session_duration: 19.2
  },
  {
    date: '2024-01-15',
    new_participants: 48,
    returning_participants: 145,
    active_sessions: 193,
    avg_session_duration: 20.1
  },
  {
    date: '2024-01-22',
    new_participants: 61,
    returning_participants: 156,
    active_sessions: 217,
    avg_session_duration: 21.3
  },
  {
    date: '2024-01-29',
    new_participants: 57,
    returning_participants: 167,
    active_sessions: 224,
    avg_session_duration: 22.0
  },
  {
    date: '2024-02-05',
    new_participants: 64,
    returning_participants: 178,
    active_sessions: 242,
    avg_session_duration: 22.8
  },
  {
    date: '2024-02-12',
    new_participants: 71,
    returning_participants: 189,
    active_sessions: 260,
    avg_session_duration: 23.5
  },
  {
    date: '2024-02-19',
    new_participants: 68,
    returning_participants: 201,
    active_sessions: 269,
    avg_session_duration: 24.2
  },
  {
    date: '2024-02-26',
    new_participants: 75,
    returning_participants: 214,
    active_sessions: 289,
    avg_session_duration: 25.1
  },
  {
    date: '2024-03-05',
    new_participants: 82,
    returning_participants: 225,
    active_sessions: 307,
    avg_session_duration: 25.8
  }
];

// Score distribution for bar charts
export const scoreDistribution: ScoreDistribution[] = [
  {
    score_range: '0-20',
    count: 45,
    percentage: 3.2
  },
  {
    score_range: '21-40',
    count: 89,
    percentage: 6.4
  },
  {
    score_range: '41-60',
    count: 234,
    percentage: 16.8
  },
  {
    score_range: '61-80',
    count: 567,
    percentage: 40.7
  },
  {
    score_range: '81-100',
    count: 458,
    percentage: 32.9
  }
];

// Radar chart data for experiment categories comparison
export const experimentRadarData: ExperimentRadarData[] = [
  {
    metric: 'Accuracy',
    cognitive: 85.2,
    decision_making: 71.4,
    perception_reaction: 91.8,
    social_emotional: 75.6,
    fullMark: 100
  },
  {
    metric: 'Engagement',
    cognitive: 90.4,
    decision_making: 86.8,
    perception_reaction: 93.2,
    social_emotional: 84.7,
    fullMark: 100
  },
  {
    metric: 'Completion Rate',
    cognitive: 89.8,
    decision_making: 82.6,
    perception_reaction: 88.4,
    social_emotional: 82.6,
    fullMark: 100
  },
  {
    metric: 'Retention',
    cognitive: 84.3,
    decision_making: 76.9,
    perception_reaction: 82.9,
    social_emotional: 77.1,
    fullMark: 100
  },
  {
    metric: 'Response Time',
    cognitive: 78.6,
    decision_making: 65.2,
    perception_reaction: 95.4,
    social_emotional: 68.7,
    fullMark: 100
  },
  {
    metric: 'User Satisfaction',
    cognitive: 87.1,
    decision_making: 79.3,
    perception_reaction: 91.6,
    social_emotional: 81.4,
    fullMark: 100
  }
];

// Top participants leaderboard
export const topParticipants: TopParticipant[] = [
  {
    id: 'user-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    total_experiments: 42,
    avg_score: 94.2,
    completion_rate: 97.6,
    last_active: '2024-03-10',
    badge: 'Gold'
  },
  {
    id: 'user-002',
    name: 'Michael Rodriguez',
    email: 'michael.r@email.com',
    total_experiments: 38,
    avg_score: 91.8,
    completion_rate: 94.7,
    last_active: '2024-03-09',
    badge: 'Gold'
  },
  {
    id: 'user-003',
    name: 'Emma Thompson',
    email: 'emma.t@email.com',
    total_experiments: 35,
    avg_score: 89.3,
    completion_rate: 91.4,
    last_active: '2024-03-08',
    badge: 'Silver'
  },
  {
    id: 'user-004',
    name: 'David Kim',
    email: 'david.kim@email.com',
    total_experiments: 33,
    avg_score: 87.6,
    completion_rate: 90.9,
    last_active: '2024-03-07',
    badge: 'Silver'
  },
  {
    id: 'user-005',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    total_experiments: 31,
    avg_score: 85.4,
    completion_rate: 87.1,
    last_active: '2024-03-06',
    badge: 'Bronze'
  },
  {
    id: 'user-006',
    name: 'James Wilson',
    email: 'james.w@email.com',
    total_experiments: 29,
    avg_score: 83.2,
    completion_rate: 85.5,
    last_active: '2024-03-05',
    badge: 'Bronze'
  },
  {
    id: 'user-007',
    name: 'Anna Martinez',
    email: 'anna.m@email.com',
    total_experiments: 28,
    avg_score: 81.7,
    completion_rate: 82.1,
    last_active: '2024-03-04',
    badge: 'Bronze'
  },
  {
    id: 'user-008',
    name: 'Robert Taylor',
    email: 'robert.t@email.com',
    total_experiments: 26,
    avg_score: 79.9,
    completion_rate: 80.8,
    last_active: '2024-03-03'
  },
  {
    id: 'user-009',
    name: 'Jessica Brown',
    email: 'jessica.b@email.com',
    total_experiments: 25,
    avg_score: 78.3,
    completion_rate: 79.2,
    last_active: '2024-03-02'
  },
  {
    id: 'user-010',
    name: 'Daniel Lee',
    email: 'daniel.lee@email.com',
    total_experiments: 24,
    avg_score: 76.8,
    completion_rate: 77.5,
    last_active: '2024-03-01'
  }
];

// Helper functions for data aggregation
export const getExperimentsByCategory = (category: string) => {
  return experimentResults.filter(exp => exp.category === category);
};

export const getActiveExperiments = () => {
  return experimentResults.filter(exp => exp.status === 'active');
};

export const getCompletedExperiments = () => {
  return experimentResults.filter(exp => exp.status === 'completed');
};

export const getTotalParticipants = () => {
  return experimentResults.reduce((total, exp) => total + exp.participants, 0);
};

export const getAverageCompletionRate = () => {
  const completedExps = getCompletedExperiments();
  return completedExps.reduce((sum, exp) => sum + exp.completion_rate, 0) / completedExps.length;
};

export const getAverageScore = () => {
  const completedExps = getCompletedExperiments();
  return completedExps.reduce((sum, exp) => sum + exp.avg_score, 0) / completedExps.length;
};

// Real-time experiment metrics
export const liveExperimentMetrics = {
  total_active_sessions: 1247,
  concurrent_users: 156,
  experiments_running: 8,
  avg_response_time: 423,
  success_rate: 94.7,
  error_rate: 0.8,
  last_updated: new Date().toISOString()
};

// Experiment insights and recommendations
export const experimentInsights = [
  {
    type: 'success',
    title: 'High Performance Category',
    description: 'Perception-Reaction experiments show 91.8% average accuracy',
    action: 'Consider expanding this category'
  },
  {
    type: 'warning',
    title: 'Low Completion Rate',
    description: 'Decision-Making experiments have 76.8% completion rate',
    action: 'Review experiment complexity and duration'
  },
  {
    type: 'info',
    title: 'Engagement Trend',
    description: 'Participant engagement increased 23% this quarter',
    action: 'Analyze successful engagement strategies'
  },
  {
    type: 'critical',
    title: 'Response Time Issue',
    description: 'Social-Emotional experiments show slower response times',
    action: 'Optimize interface and reduce cognitive load'
  }
];

// New format analytics data
export const analyticsData: AnalyticsData = {
  success: true,
  analytics: {
    overview: {
      totalParticipants: 2318,
      avgCompletionRate: 87.5,
      avgScore: 82.3,
      categoryBreakdown: {
        cognitive: 45,
        decision_making: 32,
        perception_reaction: 28,
        social_emotional: 23
      }
    },
    charts: {
      performanceByCategory: {
        labels: [
          "Cognitive",
          "Decision Making", 
          "Perception-Reaction",
          "Social-Emotional"
        ],
        datasets: [
          {
            label: "Average Score",
            data: [82.4, 74.8, 88.1, 76.3],
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgba(239, 68, 68, 1)"
          },
          {
            label: "Completion Rate",
            data: [89.8, 82.6, 88.4, 82.6],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)"
          }
        ]
      },
      metricsRadar: {
        labels: [
          "Accuracy",
          "Engagement", 
          "Retention",
          "Response Time"
        ],
        datasets: [
          {
            label: "Category Performance",
            data: [85.2, 90.4, 84.3, 78.6],
            fill: true,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 1)"
          }
        ]
      },
      trendsLine: {
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
          {
            label: "Performance Trend",
            data: [75.2, 79.1, 81.4, 82.7, 84.2, 85.6, 87.1, 88.3, 89.7, 90.2, 90.8, 91.4],
            fill: false,
            borderColor: "rgb(245, 158, 11)"
          }
        ]
      }
    }
  }
};

// Export all data as default
export default {
  analyticsData,
  experimentResults,
  performanceMetrics,
  categoryDistribution,
  participantEngagement,
  scoreDistribution,
  experimentRadarData,
  topParticipants,
  liveExperimentMetrics,
  experimentInsights,
  getExperimentsByCategory,
  getActiveExperiments,
  getCompletedExperiments,
  getTotalParticipants,
  getAverageCompletionRate,
  getAverageScore
};
