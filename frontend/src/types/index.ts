export type Industry = 'All' | 'Construction' | 'College Facilities';
export type UserRole = 'Worker' | 'Employer' | 'Auditor';
export type ActiveTab = 'landing' | 'dashboard' | 'worker-terminal' | 'employer-terminal' | 'fairpay' | 'silentshield' | 'shiftguardian' | 'activity';

export interface Site {
  id: number;
  name: string;
  industry: string;
  location: string;
  address?: string;
}

export interface Worker {
  id: number;
  name: string;
  employee_code: string;
  industry: string;
  role: string;
  site_id?: number;
  default_rate: number;
  rate_type: 'DAILY' | 'HOURLY';
  phone_masked: string;
}

export interface WageCalculateRequest {
  worker_id?: number;
  worker_name: string;
  industry: string;
  site_name?: string;
  period: string;
  rate_type: 'DAILY' | 'HOURLY';
  base_rate: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_multiplier: number;
  recorded_pay: number;
  save_record?: boolean;
}

export interface WageCalculateResponse {
  id?: number;
  worker_name: string;
  industry: string;
  site_name?: string;
  period: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  hourly_rate: number;
  overtime_multiplier: number;
  regular_pay: number;
  overtime_pay: number;
  expected_pay: number;
  recorded_pay: number;
  discrepancy: number;
  status: 'LOOKS_CONSISTENT' | 'NEEDS_REVIEW' | 'POTENTIAL_DISCREPANCY';
  formula: string;
  calculation_steps: string[];
  explanation: string;
  disclaimer: string;
  created_at?: string;
}

export interface SafetyReportAudit {
  id: number;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface SafetyReport {
  id: number;
  reference_id: string;
  title: string;
  category: 'Electrical' | 'PPE' | 'Machinery' | 'Sanitation' | 'Harassment/Concern' | 'Other';
  site_id?: number;
  site_name: string;
  location_description?: string;
  description: string;
  language: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority_reasons: string[];
  recommended_action?: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'ESCALATED';
  is_confidential: boolean;
  reporter_name?: string;
  reporter_role?: string;
  created_at: string;
  updated_at?: string;
  audits: SafetyReportAudit[];
}

export interface TriggeredRule {
  code: string;
  rule_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
}

export interface ShiftEvaluateResponse {
  id?: number;
  worker_name: string;
  industry: string;
  site_name?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  gross_hours: number;
  total_hours: number;
  rest_hours_before: number;
  consecutive_days: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  triggered_rules: TriggeredRule[];
  recommended_action: string;
  disclaimer: string;
  created_at?: string;
}

export interface DashboardMetrics {
  total_workers: number;
  open_safety_reports: number;
  critical_safety_reports: number;
  wage_discrepancies_count: number;
  wage_discrepancy_total_inr: number;
  schedule_risks_count: number;
  industry_filter: string;
  recent_reports: SafetyReport[];
  recent_wage_checks: WageCalculateResponse[];
  recent_shifts: ShiftEvaluateResponse[];
}

export interface ActivityLog {
  id: number;
  action_type: string;
  module: string;
  description: string;
  actor: string;
  target_id?: string;
  created_at: string;
}
