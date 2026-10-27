import {
  DashboardMetrics, Site, Worker, WageCalculateRequest, WageCalculateResponse,
  SafetyReport, ShiftEvaluateResponse, ActivityLog
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API request error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardMetrics: (industry?: string) => {
    const q = industry && industry !== 'All' ? `?industry=${encodeURIComponent(industry)}` : '';
    return request<DashboardMetrics>(`/dashboard/metrics${q}`);
  },

  // Sites & Workers
  getSites: (industry?: string) => {
    const q = industry && industry !== 'All' ? `?industry=${encodeURIComponent(industry)}` : '';
    return request<Site[]>(`/sites${q}`);
  },
  getWorkers: (industry?: string, site_id?: number) => {
    const params = new URLSearchParams();
    if (industry && industry !== 'All') params.append('industry', industry);
    if (site_id) params.append('site_id', site_id.toString());
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<Worker[]>(`/workers${q}`);
  },

  // FairPay AI
  calculateWage: (data: WageCalculateRequest) => {
    return request<WageCalculateResponse>('/fairpay/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getWageChecks: (industry?: string, status?: string) => {
    const params = new URLSearchParams();
    if (industry && industry !== 'All') params.append('industry', industry);
    if (status && status !== 'All') params.append('status', status);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<WageCalculateResponse[]>(`/fairpay/checks${q}`);
  },
  getWageSummary: (industry?: string) => {
    const q = industry && industry !== 'All' ? `?industry=${encodeURIComponent(industry)}` : '';
    return request<{ total_checks: number; potential_discrepancies: number; needs_review: number; consistent: number; total_shortfall_inr: number }>(`/fairpay/summary${q}`);
  },

  // SilentShield
  createSafetyReport: (data: {
    title: string;
    category: string;
    site_name: string;
    site_id?: number;
    location_description?: string;
    description: string;
    language?: string;
    is_confidential?: boolean;
    reporter_name?: string;
    reporter_role?: string;
  }) => {
    return request<SafetyReport>('/silentshield/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getSafetyReports: (params?: { industry?: string; status?: string; priority?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.industry && params.industry !== 'All') searchParams.append('industry', params.industry);
    if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params?.priority && params.priority !== 'All') searchParams.append('priority', params.priority);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<SafetyReport[]>(`/silentshield/reports${q}`);
  },
  trackSafetyReport: (reference_id: string) => {
    return request<SafetyReport>(`/silentshield/reports/track/${encodeURIComponent(reference_id)}`);
  },
  updateReportStatus: (report_id: number, status: string, changed_by: string, notes?: string) => {
    return request<SafetyReport>(`/silentshield/reports/${report_id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, changed_by, notes }),
    });
  },

  // ShiftGuardian
  evaluateShift: (data: {
    worker_id?: number;
    worker_name: string;
    industry: string;
    site_name?: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    break_minutes: number;
    rest_hours_before: number;
    consecutive_days: number;
    save_record?: boolean;
  }) => {
    return request<ShiftEvaluateResponse>('/shiftguardian/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getShiftSchedules: (industry?: string, risk_level?: string) => {
    const params = new URLSearchParams();
    if (industry && industry !== 'All') params.append('industry', industry);
    if (risk_level && risk_level !== 'All') params.append('risk_level', risk_level);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<ShiftEvaluateResponse[]>(`/shiftguardian/schedules${q}`);
  },

  // System & Activities
  resetDemoData: () => {
    return request<{ status: string; message: string }>('/system/demo-reset?confirm=true', {
      method: 'POST',
    });
  },
  getActivities: (limit = 25, module?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (module && module !== 'All') params.append('module', module);
    return request<ActivityLog[]>(`/system/activities?${params.toString()}`);
  },
  getHealth: () => {
    return request<{ status: string; service: string; version: string; database: string }>('/system/health');
  },
};
