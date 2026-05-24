import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userAPI.getProfile();
        if (res && res.id) {
          setForm({ name: res.name || '', email: res.email || '', phone: res.phone || '', password: '' });
        } else {
          // not authenticated or error
          navigate('/login');
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    load();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // clear previous messages when editing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Client-side validation: if changing password, ensure confirmation matches
      if (form.password) {
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }

      const payload = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password;

      const res = await userAPI.updateProfile(payload);

      if (!res) {
        setError('No response from server');
        setLoading(false);
        return;
      }

      // If server returned error, show its message if present
      if (!res.ok) {
        const msg = res.body && res.body.message ? res.body.message : `Request failed (${res.status})`;
        setError(msg);
        setLoading(false);
        return;
      }

      const body = res.body || {};
      if (body.user) {
        if (body.token) localStorage.setItem('token', body.token);
        if (body.user) localStorage.setItem('user', JSON.stringify(body.user));

        setSuccess('Profile updated successfully');
        setTimeout(() => window.location.reload(), 800);
      } else {
        setError(body.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error', err);
      setError('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
          <p className="mt-1 text-gray-600">View and update your account information</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Password (leave blank to keep current)</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-sm text-red-600 mt-2">Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={loading || (form.password && form.password !== form.confirmPassword)}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
