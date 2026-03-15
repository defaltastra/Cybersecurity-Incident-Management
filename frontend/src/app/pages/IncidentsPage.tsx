import { useEffect, useState } from 'react';
import { Eye, Filter, Search } from 'lucide-react';
import { Link } from 'react-router';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { getIncidents } from '../lib/api';
import type { Incident, IncidentStatus, SeverityLevel } from '../types';

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
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

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Incident Management</h1>
        <p className="text-[#D5C4A1]">View and manage all security incidents</p>
      </div>

      {error && (
        <div className="rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
          {error}
        </div>
      )}

      <div className="bg-[#32302F] border border-[#504945] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-[#D5C4A1] text-sm mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D5C4A1]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-10 py-2 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                placeholder="Search incidents..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[#D5C4A1] text-sm mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as SeverityLevel | 'all')}
              className="w-full bg-[#3C3836] border border-[#504945] rounded px-3 py-2 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-[#D5C4A1] text-sm mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as IncidentStatus | 'all')}
              className="w-full bg-[#3C3836] border border-[#504945] rounded px-3 py-2 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-[#D5C4A1] text-sm">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
      </div>

      <div className="bg-[#32302F] border border-[#504945] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3C3836]">
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Title</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Incident Type</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Severity</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Status</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Reported By</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Date</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="border-t border-[#504945] hover:bg-[#3C3836] transition-colors">
                  <td className="px-6 py-4 text-[#EBDBB2]">{incident.title}</td>
                  <td className="px-6 py-4 text-[#D5C4A1] capitalize">{incident.incidentType}</td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-6 py-4 text-[#D5C4A1]">{incident.reportedByName}</td>
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

        {!isLoading && filteredIncidents.length === 0 && (
          <div className="px-6 py-12 text-center text-[#D5C4A1]">
            No incidents found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
