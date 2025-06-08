export interface ReportsStats {
  totalEnquiries: {
    count: number;
    trend: {
      value: string;
      type: 'up' | 'down';
    };
  };
  newEnquiries: {
    count: number;
    trend: {
      value: string;
      type: 'up' | 'down';
    };
  };
  pendingFollowUps: {
    count: number;
    trend: {
      value: string;
      type: 'up' | 'down';
    };
  };
  todaysCalls: {
    count: number;
    trend: {
      value: string;
      type: 'up' | 'down';
    };
  };
}

export interface EnquiryStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface ReportsData {
  stats: ReportsStats;
  statusDistribution: EnquiryStatusDistribution[];
  monthlyTrend: MonthlyTrend[];
}
