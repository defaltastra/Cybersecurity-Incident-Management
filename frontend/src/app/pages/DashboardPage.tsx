import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Activity, AlertTriangle, CheckCircle, Eye, XCircle } from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { getIncidents } from '../lib/api';
import type { Incident } from '../types';

export function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const nextIncidents = await getIncidents();
        setIncidents(nextIncidents);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'failed to load incidents');
      } finally {
        setIsLoading(false);
      }
    };

    void loadIncidents();
  }, []);

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((incident) => incident.status === 'open' || incident.status === 'investigating').length;
  const criticalIncidents = incidents.filter((incident) => incident.severity === 'critical').length;
  const resolvedIncidents = incidents.filter((incident) => incident.status === 'resolved').length;
  const recentIncidents = incidents.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Dashboard</h1>
        <p className="text-[#D5C4A1]">Overview of security incidents</p>
      </div>

      {error && (
        <div className="rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Incidents"
          value={totalIncidents}
          icon={Activity}
          iconColor="text-[#83A598]"
          iconBgColor="bg-[#83A598]/10"
        />
        <StatsCard
          title="Open Incidents"
          value={openIncidents}
          icon={AlertTriangle}
          iconColor="text-[#FABD2F]"
          iconBgColor="bg-[#FABD2F]/10"
        />
        <StatsCard
          title="Critical Incidents"
          value={criticalIncidents}
          icon={XCircle}
          iconColor="text-[#FB4934]"
          iconBgColor="bg-[#FB4934]/10"
        />
        <StatsCard
          title="Resolved Incidents"
          value={resolvedIncidents}
          icon={CheckCircle}
          iconColor="text-[#B8BB26]"
          iconBgColor="bg-[#B8BB26]/10"
        />
      </div>

      <div className="bg-[#32302F] border border-[#504945] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#504945]">
          <h2 className="text-[#EBDBB2] text-xl">Recent Incidents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3C3836]">
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Incident Title</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Type</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Severity</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Status</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Date</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr key={incident.id} className="border-t border-[#504945] hover:bg-[#3C3836] transition-colors">
                  <td className="px-6 py-4 text-[#EBDBB2]">{incident.title}</td>
                  <td className="px-6 py-4 text-[#D5C4A1] capitalize">{incident.incidentType}</td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-6 py-4 text-[#D5C4A1]">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="inline-flex items-center gap-2 text-[#83A598] hover:text-[#B8BB26] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && recentIncidents.length === 0 && (
          <div className="px-6 py-12 text-center text-[#D5C4A1]">
            No incidents available yet.
          </div>
        )}

        <div className="px-6 py-4 border-t border-[#504945]">
          <Link
            to="/incidents"
            className="text-[#83A598] hover:text-[#B8BB26] transition-colors text-sm"
          >
            View all incidents →
          </Link>
        </div>
      </div>
    </div>
  );
}
