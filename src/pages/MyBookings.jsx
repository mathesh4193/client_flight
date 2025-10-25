import React, { useEffect, useState } from "react";
import { bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaUserFriends,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingsAPI.getAll(user.token);
        setBookings(res.data.bookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/854/854866.png"
          alt="No bookings"
          className="w-24 h-24 mb-4 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          No Bookings Found
        </h2>
        <p className="text-gray-500">
          It looks like you haven’t booked any flights yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          ✈️ My Bookings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white shadow-md rounded-2xl p-5 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Flight Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h2 className="text-lg font-semibold text-blue-700">
                  {b.flight.airline}
                </h2>
                <span className="text-sm text-gray-500">
                  #{b.flight.flightNumber}
                </span>
              </div>

              {/* Flight Details */}
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <FaPlaneDeparture className="text-blue-500" />{" "}
                  <span>{b.flight.origin}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaPlaneArrival className="text-green-500" />{" "}
                  <span>{b.flight.destination}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-orange-500" />{" "}
                  <span>
                    {new Date(b.flight.departureDate).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Passenger & Price Info */}
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <FaUserFriends className="text-purple-500" />{" "}
                  <span>{b.passengers.length} Passenger(s)</span>
                </p>
                <p>
                  <span className="font-semibold">Class:</span>{" "}
                  {b.cabinClass.charAt(0).toUpperCase() +
                    b.cabinClass.slice(1)}
                </p>
                <p className="flex items-center gap-2 font-semibold text-green-600">
                  <FaMoneyBillWave /> ₹{b.totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Booking & Payment Status */}
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Booking Status */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    b.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {b.status ? b.status.toUpperCase() : "CONFIRMED"}
                </span>

                {/* Payment Status */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    b.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : b.paymentStatus === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <FaCreditCard />
                  {b.paymentStatus
                    ? b.paymentStatus.toUpperCase()
                    : "UNPAID"}
                </span>
              </div>

              {/* View Details Button */}
              <div className="mt-4">
                <button
                  onClick={() => (window.location.href = `/bookings/${b._id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
