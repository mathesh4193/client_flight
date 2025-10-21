import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import { FaPlane, FaClock, FaMapMarkerAlt, FaUsers, FaWifi, FaUtensils, FaTv } from 'react-icons/fa';

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlightDetails();
  }, [id]);

  const fetchFlightDetails = async () => {
    try {
      const response = await flightsAPI.getById(id);
      setFlight(response.data.flight);
    } catch (err) {
      setError('Failed to load flight details');
      console.error('Flight details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = () => {
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Flight Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested flight could not be found.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Flight Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{flight.flightNumber}</h1>
                <p className="text-primary-100">{flight.airline}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ${flight.pricing.economy?.basePrice || 0}
                </div>
                <div className="text-primary-100">Economy Class</div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Departure</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{flight.origin.city} ({flight.origin.code})</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(flight.departure.date + 'T' + flight.departure.time).toLocaleString()}</span>
                  </div>
                  {flight.gate && (
                    <div className="text-sm text-gray-600">Gate: {flight.gate}</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Arrival</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{flight.destination.city} ({flight.destination.code})</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(flight.arrival.date + 'T' + flight.arrival.time).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">Duration: {flight.duration}</div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(flight.pricing).map(([classType, pricing]) => (
                  <div key={classType} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        ${pricing.basePrice}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{classType} Class</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {pricing.availableSeats} seats available
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {flight.amenities && flight.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-4">
                  {flight.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      {amenity === 'wifi' && <FaWifi className="h-4 w-4 mr-2" />}
                      {amenity === 'entertainment' && <FaTv className="h-4 w-4 mr-2" />}
                      {amenity === 'meals' && <FaUtensils className="h-4 w-4 mr-2" />}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className="text-center">
              <button
                onClick={handleBookFlight}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-semibold"
              >
                Book This Flight
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
