import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaDollarSign } from 'react-icons/fa';

const FlightDetails = () => {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await flightsAPI.getById(id);
        const flightData = res.data.flight || res.data;
        setFlight(flightData);
      } catch (error) {
        console.error("Error fetching flight:", error);
      }
    };
    fetchFlight();
  }, [id]);

  if (!flight) return <p className="text-center mt-20 text-lg">Loading flight details...</p>;

  // Fallback values
  const airline = flight.airline || "Unknown Airline";
  const flightNumber = flight.flightNumber || "N/A";
  const origin = flight.origin || "Unknown Airport";
  const destination = flight.destination || "Unknown Airport";
  const departureDate = flight.departureDate ? new Date(flight.departureDate) : null;
  const arrivalDate = flight.arrivalDate ? new Date(flight.arrivalDate) : null;
  const departure = departureDate ? departureDate.toLocaleString() : "N/A";
  const arrival = arrivalDate ? arrivalDate.toLocaleString() : "N/A";
  
  // Calculate duration dynamically
  let duration = "N/A";
  if (departureDate && arrivalDate) {
    const diffMs = arrivalDate - departureDate; // difference in milliseconds
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    duration = `${diffHours}h ${diffMinutes}m`;
  }

  const price = flight.price ? `Rs ${flight.price}` : "N/A";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {airline} ({flightNumber})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
          <FaPlaneDeparture className="text-blue-600 text-2xl" />
          <div>
            <p className="text-gray-500">Departure</p>
            <p className="font-semibold">{departure}</p>
            <p className="text-gray-700">{origin}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg">
          <FaPlaneArrival className="text-green-600 text-2xl" />
          <div>
            <p className="text-gray-500">Arrival</p>
            <p className="font-semibold">{arrival}</p>
            <p className="text-gray-700">{destination}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-yellow-50 p-4 rounded-lg">
          <FaClock className="text-yellow-600 text-2xl" />
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-semibold">{duration}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-red-50 p-4 rounded-lg">
          <FaDollarSign className="text-red-600 text-2xl" />
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-semibold">{price}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/booking/${flight._id}`)}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
      >
        Book Now
      </button>
    </div>
  );
};

export default FlightDetails;
