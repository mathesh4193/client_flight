import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookingsAPI } from "../services/api";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingsAPI.getById(id);
        setBooking(res.data.booking);
      } catch (err) {
        console.error("Failed to fetch booking details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading booking details...</p>
      </div>
    );

  if (!booking)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Booking not found!</p>
      </div>
    );

  const handleDownload = () => {
    window.open(`${import.meta.env.VITE_API_URL}/api/bookings/${booking._id}/ticket`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
          🧾 Booking Details
        </h1>

        {/* Flight Info */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Flight Information</h2>
          <p className="flex items-center gap-2">
            <FaPlaneDeparture className="text-blue-500" /> {booking.flight.origin}
          </p>
          <p className="flex items-center gap-2">
            <FaPlaneArrival className="text-green-500" /> {booking.flight.destination}
          </p>
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-orange-500" />{" "}
            {new Date(booking.flight.departureDate).toLocaleString()}
          </p>
          <p className="font-medium text-gray-600">
            Airline: {booking.flight.airline} ({booking.flight.flightNumber})
          </p>
        </div>

        {/* Passengers */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Passengers</h2>
          {booking.passengers.map((p, i) => (
            <p key={i} className="text-gray-600">
              {i + 1}. {p.firstName} {p.lastName} — {p.gender} — DOB: {p.dateOfBirth}
            </p>
          ))}
        </div>

        {/* Payment Info */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment Summary</h2>
          <p className="flex items-center gap-2 text-green-700 font-semibold">
            <FaMoneyBillWave /> ₹{booking.totalPrice.toFixed(2)}
          </p>
          <p>Status: 
            <span className={`ml-2 font-semibold ${
              booking.status === "confirmed" ? "text-green-600" : "text-yellow-600"
            }`}>
              {booking.status.toUpperCase()}
            </span>
          </p>
        </div>

        {/* Download Ticket Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            🎟️ Download Ticket (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
