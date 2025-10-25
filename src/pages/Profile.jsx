// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { authAPI, bookingsAPI } from '../services/api';
import { FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', phone: '', preferences: {} });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser((prev) => ({ ...prev, ...res.data.user }));
      } catch (err) {
        console.error('Error loading profile:', err);
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await bookingsAPI.getUserBookings();
        if (res.data && res.data.bookings) {
          setBookings(res.data.bookings);
        } else if (res.data && Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings', err);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchProfile();
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setUser((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleNotification = (type) => {
    setUser((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: { ...prev.preferences.notifications, [type]: !prev.preferences.notifications?.[type] },
      },
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    try {
      const res = await authAPI.updateProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
      });
      setUser(res.data.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <FaUserCircle className="text-6xl text-blue-500" />
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-bold">{user.name || 'User Name'}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone || '-'}</p>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Update Profile & Preferences</h2>

          {message && <p className="mb-4 text-green-600">{message}</p>}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={user.name || ''}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={user.email || ''}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={user.phone || ''}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-4 border-t pt-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Language</label>
                  <select
                    name="preferences.language"
                    value={user.preferences?.language || 'en'}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Currency</label>
                  <select
                    name="preferences.currency"
                    value={user.preferences?.currency || 'USD'}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Seat Preference</label>
                  <select
                    name="preferences.seatPreference"
                    value={user.preferences?.seatPreference || 'any'}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="any">Any</option>
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                    <option value="middle">Middle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!user.preferences?.notifications?.email}
                    onChange={() => handleToggleNotification('email')}
                  />
                  <span className="text-sm">Email alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!user.preferences?.notifications?.sms}
                    onChange={() => handleToggleNotification('sms')}
                  />
                  <span className="text-sm">SMS alerts</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
            >
              {updating ? 'Updating…' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Booking History</h2>

          {bookingsLoading ? (
            <p>Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {bookings.map((b) => (
                <li
                  key={b._id}
                  className="p-3 border rounded-md flex justify-between items-start hover:shadow-md transition"
                >
                  <div>
                    <div className="font-medium">{b.flightName || b.flightNumber || 'Booking'}</div>
                    <div className="text-sm text-gray-600">Booked on: {new Date(b.createdAt).toLocaleString()}</div>
                    <div className="text-sm">
                      Status: <span className="font-semibold">{b.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      className="text-sm underline text-blue-600 hover:text-blue-800"
                      onClick={() => window.location.href = `/bookings/${b._id}`}
                    >
                      View
                    </button>
                    {b.status !== 'cancelled' && (
                      <button
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                          try {
                            await bookingsAPI.cancel(b._id, {});
                            setBookings((prev) => prev.map(x => x._id === b._id ? { ...x, status: 'cancelled' } : x));
                          } catch (err) {
                            console.error('Cancel failed', err);
                          }
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
