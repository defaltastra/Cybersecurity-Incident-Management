import { useState } from 'react';
import { ShieldOff, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile, disconnect } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);
    try {
      await updateProfile({ name, email, newPassword: newPassword || undefined });
      setSuccessMsg('Profile updated successfully.');
      setNewPassword('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Settings</h1>
        <p className="text-[#D5C4A1]">Manage your profile and account</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <form onSubmit={handleSave}>
          <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-[#83A598]" />
              <h2 className="text-[#EBDBB2]">Profile</h2>
            </div>

            {successMsg && (
              <p className="text-sm text-[#B8BB26]">{successMsg}</p>
            )}
            {errorMsg && (
              <p className="text-sm text-[#FB4934]">{errorMsg}</p>
            )}

            <div>
              <label className="block text-[#D5C4A1] text-sm mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-2 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#D5C4A1] text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-2 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#D5C4A1] text-sm mb-2">
                New Password
                <span className="text-[#928374] ml-1">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-2 text-[#EBDBB2] focus:outline-none focus:border-[#B8BB26] transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#B8BB26] text-[#282828] px-6 py-2 rounded hover:bg-[#A8AB16] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-[#504945] text-[#EBDBB2] px-6 py-3 rounded hover:bg-[#665C54] transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 bg-[#FB4934] text-[#282828] px-6 py-3 rounded hover:bg-[#EB3924] transition-colors"
          >
            <ShieldOff className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
