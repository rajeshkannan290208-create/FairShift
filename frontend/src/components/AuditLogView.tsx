import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { api } from '../services/api';
import { 
  History, RefreshCw, CheckCircle2, Cpu, Database
} from 'lucide-react';

interface AuditLogViewProps {
  onResetDemo: () => void;
  isResetting: boolean;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  onResetDemo,
  isResetting
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [moduleFilter, setModuleFilter] = useState('All');

  const loadData = async () => {
    try {
      const [l, h] = await Promise.all([
        api.getActivities(50, moduleFilter),
        api.getHealth()
      ]);
      setLogs(l);
      setHealth(h);
    } catch (e) {
      console.error('Error loading audit logs', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [moduleFilter]);

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/5 text-neutral-200 border border-white/10">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2]">
                Audit Trail &amp; System Telemetry
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Immutable system event logs, status changes, and demonstration environment controls.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Reset Action */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer self-start md:self-auto shadow-md shadow-[#A31C1B]/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Restoring...' : 'Reset Demo Data'}</span>
        </button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#1FB882]" />
            <span>Platform Service</span>
          </span>
          <div className="text-base font-bold text-[#F8F7F2]">
            {health?.service || 'FairShift Core Engine'}
          </div>
          <span className="text-[10px] text-[#1FB882] font-mono">
            Version {health?.version || '1.0.0-hackathon-final'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#1FB882]" />
            <span>Database Connection</span>
          </span>
          <div className="text-base font-bold text-[#F8F7F2]">
            {health?.database === 'healthy' ? 'Active & Synced' : health?.database}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            Environment: {health?.environment || 'Development'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#06110C] border border-[#1FB882]/20 space-y-1 shadow-lg">
          <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB882]" />
            <span>AI Architecture</span>
          </span>
          <div className="text-base font-bold text-[#1FB882]">
            Deterministic Rules
          </div>
          <span className="text-[10px] text-neutral-400">
            Verified zero external LLM API dependencies
          </span>
        </div>
      </div>

      {/* Activity Log Ledger */}
      <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-sm text-[#F8F7F2]">
              Recent Audit Events Ledger
            </h2>
            <p className="text-[11px] text-neutral-400">Timeline of wage checks, hazard reports, and supervisor actions.</p>
          </div>

          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-white/10 text-xs">
            <span className="text-[10px] font-mono text-neutral-400 px-1 uppercase">Module:</span>
            {['All', 'FairPay', 'SilentShield', 'ShiftGuardian', 'System'].map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  moduleFilter === m ? 'bg-[#A31C1B] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#121212] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className={`px-2 py-0.2 rounded font-mono font-bold text-[10px] shrink-0 ${
                    log.module === 'FairPay' ? 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30' :
                    log.module === 'SilentShield' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                    log.module === 'ShiftGuardian' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                    'bg-white/5 text-neutral-200 border border-white/10'
                  }`}>
                    {log.module}
                  </span>

                  <div>
                    <p className="text-neutral-200 font-medium">{log.description}</p>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>Actor: <strong className="text-neutral-300">{log.actor}</strong></span>
                      {log.target_id && <span>• Target: <code className="font-mono text-[#1FB882]">{log.target_id}</code></span>}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-neutral-400 shrink-0 sm:text-right">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-neutral-400">
              No audit logs found for the selected module.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
