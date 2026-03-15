import { useEffect, useState } from 'react';
import { Eye, Trash2, Users } from 'lucide-react';
import { deleteUser, getUsers } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    setError('');
    setIsDeleting(userId);

    try {
      await deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((existingUser) => existingUser.id !== userId));
      setSelectedUser((currentSelected) => (currentSelected?.id === userId ? null : currentSelected));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#504945] bg-[#32302F] p-6 text-[#D5C4A1]">
          Only admins can view user management.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#EBDBB2] text-2xl mb-2">Analyst Management</h1>
        <p className="text-[#D5C4A1]">View and manage analyst accounts</p>
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
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Name</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Email</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Created</th>
                <th className="text-left text-[#D5C4A1] px-6 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((listedUser) => (
                <tr key={listedUser.id} className="border-t border-[#504945] hover:bg-[#3C3836] transition-colors">
                  <td className="px-6 py-4 text-[#EBDBB2]">{listedUser.name}</td>
                  <td className="px-6 py-4 text-[#D5C4A1]">{listedUser.email}</td>
                  <td className="px-6 py-4 text-[#D5C4A1]">
                    {new Date(listedUser.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(listedUser)}
                        className="inline-flex items-center gap-1 rounded bg-[#83A598] px-3 py-2 text-[#282828] hover:bg-[#73A588] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        type="button"
                        disabled={listedUser.id === user.id || isDeleting === listedUser.id}
                        onClick={() => handleDelete(listedUser.id)}
                        className="inline-flex items-center gap-1 rounded bg-[#FB4934] px-3 py-2 text-[#282828] hover:bg-[#EB3924] transition-colors disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting === listedUser.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && users.length === 0 && (
          <div className="px-6 py-12 text-center text-[#D5C4A1]">
            No users found.
          </div>
        )}

        {isLoading && (
          <div className="px-6 py-12 text-center text-[#D5C4A1] flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            Loading users...
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="bg-[#32302F] border border-[#504945] rounded-lg p-6">
          <h2 className="text-[#EBDBB2] text-lg mb-4">Analyst Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#D5C4A1]">Name</p>
              <p className="text-[#EBDBB2]">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-[#D5C4A1]">Email</p>
              <p className="text-[#EBDBB2]">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-[#D5C4A1]">Created</p>
              <p className="text-[#EBDBB2]">{new Date(selectedUser.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[#D5C4A1]">Role</p>
              <p className="text-[#EBDBB2]">{selectedUser.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}