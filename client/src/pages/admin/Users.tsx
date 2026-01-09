import { useState, useEffect } from 'react';
import axios from 'axios';
import UserActionModal from '../../components/admin/UserActionModal';
import UserFilters from '../../components/admin/UserFilters';
import UserTable from '../../components/admin/UserTable';
import Pagination from '../../components/admin/Pagination';

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

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'block' | 'suspend' | 'message' | 'delete'>('block');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; isBlocked: boolean } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users', {
        params: {
          page,
          limit: 20,
          ...(search && { search }),
          ...(roleFilter && { role: roleFilter }),
          ...(statusFilter && { status: statusFilter }),
        },
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, updates);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleBlockUser = (userId: string, userName: string, currentlyBlocked: boolean) => {
    if (currentlyBlocked) {
      // Unblock immediately without modal
      handleBlockConfirm(userId, currentlyBlocked, {});
    } else {
      // Show modal for blocking
      setSelectedUser({ id: userId, name: userName, isBlocked: currentlyBlocked });
      setModalType('block');
      setModalOpen(true);
    }
  };

  const handleBlockConfirm = async (userId: string, currentlyBlocked: boolean, data: any) => {
    const action = currentlyBlocked ? 'unblock' : 'block';

    try {
      await axios.post(`/api/admin/users/${userId}/block`, {
        is_blocked: !currentlyBlocked,
        block_reason: data.reason || null,
      });
      alert(`User ${action}ed successfully`);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  const handleSuspendUser = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName, isBlocked: false });
    setModalType('suspend');
    setModalOpen(true);
  };

  const handleSuspendConfirm = async (userId: string, data: any) => {
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + parseInt(data.days));

    try {
      await axios.post(`/api/admin/users/${userId}/suspend`, {
        suspend_until: suspendUntil.toISOString(),
        reason: data.reason,
      });
      alert(`User suspended for ${data.days} days`);
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleSendMessage = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName, isBlocked: false });
    setModalType('message');
    setModalOpen(true);
  };

  const handleMessageConfirm = async (userId: string, data: any) => {
    try {
      await axios.post(`/api/admin/users/${userId}/message`, {
        subject: data.subject,
        message: data.message,
      });
      alert('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName, isBlocked: false });
    setModalType('delete');
    setModalOpen(true);
  };

  const handleDeleteConfirm = async (userId: string) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        data: { permanent: true }
      });
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleModalConfirm = (data: any) => {
    if (!selectedUser) return;

    switch (modalType) {
      case 'block':
        handleBlockConfirm(selectedUser.id, selectedUser.isBlocked, data);
        break;
      case 'suspend':
        handleSuspendConfirm(selectedUser.id, data);
        break;
      case 'message':
        handleMessageConfirm(selectedUser.id, data);
        break;
      case 'delete':
        handleDeleteConfirm(selectedUser.id);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage all users and their permissions</p>
        </div>

        <UserFilters
          search={search}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              onUpdateUser={handleUpdateUser}
              onBlockUser={handleBlockUser}
              onSuspendUser={handleSuspendUser}
              onSendMessage={handleSendMessage}
              onDeleteUser={handleDeleteUser}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      <UserActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === 'block' ? 'Block User' :
          modalType === 'suspend' ? 'Suspend User' :
          modalType === 'message' ? 'Send Message' :
          'Delete User'
        }
        actionType={modalType}
        userName={selectedUser?.name || ''}
      />
    </div>
  );
}