import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import api, { bookingsAPI } from "../services/api";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingsAPI.getById(id);
        if (res.data.success) {
          setBooking(res.data.booking);
        } else {
          setError("Booking not found.");
        }
      } catch (err) {
        console.error("Failed to fetch booking details", err);
        setError("Failed to fetch booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleDownload = async () => {
    if (!booking?._id) return;

    try {
      const res = await api.get(`/api/bookings/${booking._id}/ticket`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);

      // Extract filename from headers if available
      let filename = `ticket-${booking._id}.pdf`;
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (match && match[1]) filename = match[1].replace(/['"]/g, "");
      }

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Ticket download failed", err);
      alert(err.response?.data?.message || "Failed to download ticket. Please ensure you are logged in.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Booking not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">🧾 Booking Details</h1>

        {/* Booking Info */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Booking Information</h2>
          <p className="text-sm text-gray-600 mb-2">Booking ID: <span className="font-medium">{booking._id}</span></p>
          {booking.contactInfo && booking.contactInfo.email && (
            <p className="text-sm text-gray-600 mb-2">Email: <span className="font-medium">{booking.contactInfo.email}</span></p>
          )}
        </div>

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
          <p className="font-medium text-gray-600">
            Class: {booking.cabinClass.charAt(0).toUpperCase() + booking.cabinClass.slice(1)}
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
          <p>
            Status:{" "}
            <span
              className={`ml-2 font-semibold ${
                booking.status === "confirmed" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {booking.status.toUpperCase()}
            </span>
          </p>
          <p>
            Payment:{" "}
            <span
              className={`ml-2 font-semibold ${
                booking.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
              }`}
            >
              {booking.paymentStatus.toUpperCase()}
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
