import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs } from '../lib/api';
import type { AuditLog } from '../types';

export function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const loadedLogs = await getAuditLogs();
        setLogs(loadedLogs);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };

    void loadLogs();
  }, []);

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#504945] bg-[#32302F] p-6 text-[#D5C4A1]">
          Only admins can view audit logs.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Audit Logs</h1>
        <p className="text-[#D5C4A1]">Administrative activity timeline</p>
      </div>

      {error && (
        <div className="rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
          {error}
        </div>
      )}

      <div className="bg-[#32302F] border border-[#504945] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3C3836]">
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Time</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Actor</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Action</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Entity</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[#504945] hover:bg-[#3C3836] transition-colors">
                  <td className="px-6 py-4 text-[#D5C4A1]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#EBDBB2]">{log.actorEmail || `User ${log.actorUserId ?? '-'}`}</td>
                  <td className="px-6 py-4 text-[#D5C4A1]">{log.action}</td>
                  <td className="px-6 py-4 text-[#D5C4A1]">
                    {log.entityType}{log.entityId ? ` #${log.entityId}` : ''}
                  </td>
                  <td className="px-6 py-4 text-[#D5C4A1]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="px-6 py-12 text-center text-[#D5C4A1] flex items-center justify-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Loading audit logs...
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="px-6 py-12 text-center text-[#D5C4A1]">
            No audit logs yet.
          </div>
        )}
      </div>
    </div>
  );
}
