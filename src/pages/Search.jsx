import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { flightsAPI } from "../services/api";

const Search = () => {
  const location = useLocation();
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    passengers: 1,
    class: "economy",
  });

  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const origin = params.get("origin") || "";
    const destination = params.get("destination") || "";
    const departureDate = params.get("departureDate") || "";
    const passengers = parseInt(params.get("passengers") || "1", 10);
    const seatClass = params.get("class") || "economy";
    setSearchData({ origin, destination, departureDate, passengers, class: seatClass });
  }, [location.search]);

  const searchFlights = useCallback(async () => {
    if (!searchData.origin || !searchData.destination || !searchData.departureDate) return;
    try {
      setLoading(true);
      setError("");
      const response = await flightsAPI.search({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        passengers: searchData.passengers,
        class: searchData.class,
      });
      setFlights(response.data.flights || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
      setError(error.response?.data?.message || "Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  }, [searchData]);

  useEffect(() => {
    searchFlights();
  }, [searchFlights]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Search Flights</h1>

      {/* Search Form */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
        <input
          type="text"
          name="origin"
          placeholder="Origin (e.g., JFK)"
          value={searchData.origin}
          onChange={handleChange}
          className="border p-2 rounded w-full sm:w-1/5"
        />
        <input
          type="text"
          name="destination"
          placeholder="Destination (e.g., LAX)"
          value={searchData.destination}
          onChange={handleChange}
          className="border p-2 rounded w-full sm:w-1/5"
        />
        <input
          type="date"
          name="departureDate"
          value={searchData.departureDate}
          onChange={handleChange}
          className="border p-2 rounded w-full sm:w-1/5"
        />
        <select
          name="class"
          value={searchData.class}
          onChange={handleChange}
          className="border p-2 rounded w-full sm:w-1/5"
        >
          <option value="economy">Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
        <button
          onClick={searchFlights}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading && <p className="text-center">Loading…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && flights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flights.map((flight) => (
            <div key={flight._id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">
                {flight.airline} — {flight.flightNumber}
              </h2>
              <p>
                From: {flight.origin?.city} ({flight.origin?.code}) → To: {flight.destination?.city} ({flight.destination?.code})
              </p>
              <p>Date: {new Date(flight.departure?.date).toLocaleString()}</p>
              <div className="mt-2 text-sm text-gray-700">
                <p>Economy: ${flight.pricing?.economy?.basePrice}</p>
                <p>Business: ${flight.pricing?.business?.basePrice}</p>
                <p>First: ${flight.pricing?.first?.basePrice}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/flight/${flight._id}`}
                  className="flex-1 text-center bg-gray-100 text-gray-800 px-3 py-2 rounded hover:bg-gray-200"
                >
                  Details
                </Link>
                <Link
                  to={`/booking/${flight._id}`}
                  className="flex-1 text-center bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700"
                >
                  Book
                </Link>
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

export default Search;
