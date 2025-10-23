import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { flightsAPI } from "../services/api";

const SearchFlights = () => {
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    cabinClass: "economy",
    passengers: 1,
  });

  const [flights, setFlights] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all flights to populate origin/destination options
  const fetchFlightOptions = async () => {
    try {
      const res = await flightsAPI.getAll();
      const allFlights = res.data.flights || [];

      const uniqueOrigins = [...new Set(allFlights.map(f => f.origin))];
      const uniqueDestinations = [...new Set(allFlights.map(f => f.destination))];

      setOrigins(uniqueOrigins);
      setDestinations(uniqueDestinations);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFlightOptions();
  }, []);

  // Search flights based on user selection
  const fetchFlights = useCallback(async () => {
    if (!searchData.origin || !searchData.destination || !searchData.departureDate) return;

    try {
      setLoading(true);
      setError("");
      const res = await flightsAPI.search({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        passengers: searchData.passengers,
        cabinClass: searchData.cabinClass,
      });
      setFlights(res.data.flights || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  }, [searchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Search Flights</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
        <select name="origin" value={searchData.origin} onChange={handleChange} className="border p-2 rounded w-full sm:w-1/5">
          <option value="">Select Origin</option>
          {origins.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>

        <select name="destination" value={searchData.destination} onChange={handleChange} className="border p-2 rounded w-full sm:w-1/5">
          <option value="">Select Destination</option>
          {destinations.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <input type="date" name="departureDate" value={searchData.departureDate} onChange={handleChange} className="border p-2 rounded w-full sm:w-1/5" />

        <select name="cabinClass" value={searchData.cabinClass} onChange={handleChange} className="border p-2 rounded w-full sm:w-1/5">
          <option value="economy">Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>

        {/* Passengers */}
        <select name="passengers" value={searchData.passengers} onChange={handleChange} className="border p-2 rounded w-full sm:w-1/5">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>
          ))}
        </select>

        <button onClick={fetchFlights} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Search
        </button>
      </div>

      {loading && <p className="text-center">Loading flights…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && flights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flights.map(flight => (
            <div key={flight._id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{flight.airline} — {flight.flightNumber}</h2>
              <p>From: {flight.origin} → To: {flight.destination}</p>
              <p>Date: {new Date(flight.departureDate).toLocaleString()}</p>
              <p>Passengers: {searchData.passengers}</p>
              <p>Price: ${flight.price}</p>
              <div className="mt-4 flex gap-2">
                <Link to={`/flight/${flight._id}`} className="flex-1 text-center bg-gray-100 text-gray-800 px-3 py-2 rounded hover:bg-gray-200">Details</Link>
                <Link to={`/booking/${flight._id}`} className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Book</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-gray-600 mt-4">No flights found.</p>
      )}
    </div>
  );
};

export default SearchFlights;
