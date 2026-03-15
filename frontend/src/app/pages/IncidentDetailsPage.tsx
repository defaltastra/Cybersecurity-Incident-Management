import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, Trash2, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { deleteIncident, getIncident, updateIncident, updateIncidentStatus } from '../lib/api';
import type { Incident, IncidentStatus, IncidentType, SeverityLevel } from '../types';

export function IncidentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [incident, setIncident] = useState<Incident | null>(null);
  const [status, setStatus] = useState<IncidentStatus>('open');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('phishing');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isLockedForAnalyst = user?.role === 'Analyst' && incident?.status === 'resolved';

  useEffect(() => {
    const incidentId = Number(id);

    if (!incidentId) {
      setError('invalid incident id');
      setIsLoading(false);
      return;
    }

    const loadIncident = async () => {
      try {
        const nextIncident = await getIncident(incidentId);
        setIncident(nextIncident);
        setStatus(nextIncident.status);
        setTitle(nextIncident.title);
        setDescription(nextIncident.description);
        setIncidentType(nextIncident.incidentType);
        setSeverity(nextIncident.severity);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'failed to load incident');
      } finally {
        setIsLoading(false);
      }
    };

    void loadIncident();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!incident) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const updatedIncident = await updateIncidentStatus(incident.id, status);
      setIncident(updatedIncident);
      setStatus(updatedIncident.status);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to update incident');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async () => {
    if (!incident) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const updatedIncident = await updateIncidentStatus(incident.id, 'resolved');
      setIncident(updatedIncident);
      setStatus(updatedIncident.status);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to resolve incident');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIncident = async () => {
    if (!incident) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const updatedIncident = await updateIncident(incident.id, {
        title,
        description,
        incidentType,
        severity,
      });
      setIncident(updatedIncident);
      setTitle(updatedIncident.title);
      setDescription(updatedIncident.description);
      setIncidentType(updatedIncident.incidentType);
      setSeverity(updatedIncident.severity);
      setStatus(updatedIncident.status);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to update incident');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!incident) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await deleteIncident(incident.id);
      navigate('/incidents');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to delete incident');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-[#D5C4A1]">Loading incident...</div>;
  }

  if (!incident) {
    return (
      <div className="p-6">
        <div className="bg-[#32302F] border border-[#504945] rounded-lg p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[#FABD2F] mx-auto mb-4" />
          <h2 className="text-[#EBDBB2] text-xl mb-2">Incident Not Found</h2>
          <p className="text-[#D5C4A1] mb-6">The incident you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/incidents')}
            className="bg-[#B8BB26] text-[#282828] px-6 py-2 rounded hover:bg-[#A8AB16] transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 text-[#D5C4A1] hover:text-[#EBDBB2] hover:bg-[#3C3836] rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#EBDBB2] text-2xl">Incident Details</h1>
            <p className="text-[#D5C4A1] text-sm">ID: {incident.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {error && (
        <div className="rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
          {error}
        </div>
      )}

      {isLockedForAnalyst && (
        <div className="rounded border border-[#FABD2F] bg-[#FABD2F]/10 px-4 py-3 text-sm text-[#FABD2F]">
          This incident is resolved. Analysts cannot edit resolved incidents.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <h2 className="text-[#D5C4A1] text-sm mb-2">Title</h2>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSaving || isLockedForAnalyst}
              className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors disabled:opacity-60"
            />
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <h2 className="text-[#D5C4A1] text-sm mb-2">Description</h2>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              disabled={isSaving || isLockedForAnalyst}
              className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors resize-none disabled:opacity-60"
            />
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#D5C4A1] text-sm mb-2">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(event) => setIncidentType(event.target.value as IncidentType)}
                  disabled={isSaving || isLockedForAnalyst}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors disabled:opacity-60"
                >
                  <option value="phishing">Phishing</option>
                  <option value="malware">Malware</option>
                  <option value="intrusion">Intrusion</option>
                  <option value="data breach">Data Breach</option>
                </select>
              </div>

              <div>
                <label className="block text-[#D5C4A1] text-sm mb-2">Severity</label>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as SeverityLevel)}
                  disabled={isSaving || isLockedForAnalyst}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors disabled:opacity-60"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSaveIncident}
                disabled={isSaving || isLockedForAnalyst}
                className="flex items-center gap-2 bg-[#83A598] text-[#282828] px-6 py-3 rounded hover:bg-[#73A588] transition-colors disabled:opacity-60"
              >
                <AlertTriangle className="w-4 h-4" />
                Save Incident Details
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-3 bg-[#32302F] border border-[#504945] rounded-lg p-4 w-full">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as IncidentStatus)}
                disabled={isSaving || isLockedForAnalyst}
                className="bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#83A598] transition-colors"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={isSaving || isLockedForAnalyst}
                className="flex items-center gap-2 bg-[#83A598] text-[#282828] px-6 py-3 rounded hover:bg-[#73A588] transition-colors disabled:opacity-60"
              >
                <AlertTriangle className="w-4 h-4" />
                Save Status
              </button>
            </div>
            <button
              onClick={handleResolve}
              disabled={isSaving || isLockedForAnalyst || incident.status === 'resolved'}
              className="flex items-center gap-2 bg-[#B8BB26] text-[#282828] px-6 py-3 rounded hover:bg-[#A8AB16] transition-colors disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve Incident
            </button>
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#FB4934] text-[#282828] px-6 py-3 rounded hover:bg-[#EB3924] transition-colors disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                Delete Incident
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <h3 className="text-[#D5C4A1] text-sm mb-2">Incident Type</h3>
            <p className="text-[#EBDBB2] capitalize">{incident.incidentType}</p>
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <h3 className="text-[#D5C4A1] text-sm mb-2">Severity Level</h3>
            <SeverityBadge severity={incident.severity} />
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <h3 className="text-[#D5C4A1] text-sm mb-2">Current Status</h3>
            <StatusBadge status={incident.status} />
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#D5C4A1]" />
              <h3 className="text-[#D5C4A1] text-sm">Reported By</h3>
            </div>
            <p className="text-[#EBDBB2]">{incident.reportedByName}</p>
          </div>

          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#D5C4A1]" />
              <h3 className="text-[#D5C4A1] text-sm">Date Created</h3>
            </div>
            <p className="text-[#EBDBB2]">
              {new Date(incident.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-[#D5C4A1] text-sm mt-1">
              {new Date(incident.createdAt).toLocaleTimeString('en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
