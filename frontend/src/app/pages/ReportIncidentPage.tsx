import { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { createIncident } from '../lib/api';
import type { IncidentType, SeverityLevel } from '../types';

export function ReportIncidentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('phishing');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setError('you need to sign in before reporting an incident');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await createIncident({
        title,
        description,
        incidentType,
        severity,
        status: 'open',
        reportedByUserId: user.id,
      });

      navigate('/incidents');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to report incident');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Report New Incident</h1>
        <p className="text-[#D5C4A1]">Submit details about a security incident</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#504945]">
            <div className="p-3 bg-[#B8BB26]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#B8BB26]" />
            </div>
            <div>
              <h2 className="text-[#EBDBB2]">Incident Report Form</h2>
              <p className="text-[#D5C4A1] text-sm">All fields are required</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-[#EBDBB2] mb-2">
                Incident Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                placeholder="Brief description of the incident"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-[#EBDBB2] mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors resize-none"
                placeholder="Provide detailed information about the incident, including what happened, when it occurred, and any relevant details..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="incidentType" className="block text-[#EBDBB2] mb-2">
                  Incident Type
                </label>
                <select
                  id="incidentType"
                  value={incidentType}
                  onChange={(event) => setIncidentType(event.target.value as IncidentType)}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
                  required
                >
                  <option value="phishing">Phishing</option>
                  <option value="malware">Malware</option>
                  <option value="intrusion">Intrusion</option>
                  <option value="data breach">Data Breach</option>
                </select>
              </div>

              <div>
                <label htmlFor="severity" className="block text-[#EBDBB2] mb-2">
                  Severity Level
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as SeverityLevel)}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reporterName" className="block text-[#EBDBB2] mb-2">
                Reporter
              </label>
              <input
                id="reporterName"
                type="text"
                value={user?.name ?? ''}
                readOnly
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                placeholder="Sign in to report incidents"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#B8BB26] text-[#282828] px-6 py-3 rounded hover:bg-[#A8AB16] transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/incidents')}
                className="bg-[#3C3836] text-[#EBDBB2] px-6 py-3 rounded hover:bg-[#504945] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-[#83A598]/10 border border-[#83A598] rounded-lg p-4">
          <p className="text-[#EBDBB2] text-sm">
            <span className="text-[#83A598]">note:</span> all incident reports are logged and will be reviewed by the security team. critical incidents will receive immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
}
