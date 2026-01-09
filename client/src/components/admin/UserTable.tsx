import { CheckCircle, XCircle, Shield, Ban, Clock, Mail, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  story_count: string;
  comment_count: string;
  likes_given: string;
}

interface UserTableProps {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onBlockUser: (userId: string, userName: string, currentlyBlocked: boolean) => void;
  onSuspendUser: (userId: string, userName: string) => void;
  onSendMessage: (userId: string, userName: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export default function UserTable({
  users,
  onUpdateUser,
  onBlockUser,
  onSuspendUser,
  onSendMessage,
  onDeleteUser,
}: UserTableProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar_url}
                          alt={user.full_name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.full_name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                    className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 text-sm focus:border-primary-600 focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {user.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-300">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {user.email_verified && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex flex-col gap-1">
                    <span>{user.story_count} stories</span>
                    <span className="text-xs text-gray-400">
                      {user.comment_count} comments
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onBlockUser(user.id, user.full_name, !user.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_active
                          ? 'hover:bg-red-600/20 text-red-500'
                          : 'hover:bg-green-600/20 text-green-500'
                      }`}
                      title={user.is_active ? 'Block user' : 'Unblock user'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSuspendUser(user.id, user.full_name)}
                      className="p-2 hover:bg-yellow-600/20 text-yellow-500 rounded-lg transition-colors"
                      title="Suspend user"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSendMessage(user.id, user.full_name)}
                      className="p-2 hover:bg-primary-600/20 text-primary-500 rounded-lg transition-colors"
                      title="Send message"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id, user.full_name)}
                      className="p-2 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

