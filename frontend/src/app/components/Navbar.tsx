import { ShieldOff, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { user, disconnect } = useAuth();

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  return (
    <div className="h-16 bg-[#32302F] border-b border-[#504945] px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-[#EBDBB2]">Cybersecurity Incident Management</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#3C3836] rounded border border-[#504945]">
          <User className="w-5 h-5 text-[#D5C4A1]" />
          <span className="text-[#EBDBB2] text-sm">{user?.name ?? 'Guest User'}</span>
        </div>

        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex items-center gap-2 px-3 py-2 bg-[#FB4934] text-[#282828] rounded hover:bg-[#EB3924] transition-colors"
        >
          <ShieldOff className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </div>
  );
}
