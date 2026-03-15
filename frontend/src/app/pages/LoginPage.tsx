import { useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, role: 'Analyst' });
      }

      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#282828] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#32302F] rounded-full border border-[#504945]">
              <Shield className="w-12 h-12 text-[#B8BB26]" />
            </div>
          </div>
          <h1 className="text-[#EBDBB2] text-3xl mb-2">Cybersecurity Incident Manager</h1>
          <p className="text-[#D5C4A1]">Secure access to incident management</p>
        </div>

        <div className="bg-[#32302F] border border-[#504945] rounded-lg p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded transition-colors ${
                mode === 'login' ? 'bg-[#B8BB26] text-[#282828]' : 'bg-[#3C3836] text-[#EBDBB2]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded transition-colors ${
                mode === 'register' ? 'bg-[#83A598] text-[#282828]' : 'bg-[#3C3836] text-[#EBDBB2]'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-[#EBDBB2] mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-4 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                  placeholder="Admin User"
                  required={mode === 'register'}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[#EBDBB2] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D5C4A1]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-10 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                  placeholder="admin@test.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[#EBDBB2] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D5C4A1]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-[#3C3836] border border-[#504945] rounded px-10 py-3 text-[#EBDBB2] placeholder-[#D5C4A1] focus:outline-none focus:border-[#B8BB26] transition-colors"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded border border-[#FB4934] bg-[#FB4934]/10 px-4 py-3 text-sm text-[#FB4934]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#B8BB26] text-[#282828] py-3 rounded hover:bg-[#A8AB16] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-[#D5C4A1] text-sm">
            {mode === 'login'
              ? 'use an existing account to access live incidents'
              : 'registration creates a user in the backend database'}
          </div>
        </div>


      </div>
    </div>
  );
}
