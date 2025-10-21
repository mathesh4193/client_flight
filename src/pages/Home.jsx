import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlane, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers,
  FaShieldAlt,
  FaClock,
  FaHeadset
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      origin: searchData.origin,
      destination: searchData.destination,
      departureDate: searchData.departureDate,
      passengers: searchData.passengers,
      class: searchData.class
    });
    
    if (searchData.returnDate) {
      queryParams.append('returnDate', searchData.returnDate);
    }
    
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: <FaShieldAlt className="h-8 w-8 text-primary-600" />,
      title: "Secure Booking",
      description: "Your personal and payment information is protected with industry-standard encryption."
    },
    {
      icon: <FaClock className="h-8 w-8 text-primary-600" />,
      title: "Real-time Updates",
      description: "Get instant notifications about flight delays, cancellations, and gate changes."
    },
    {
      icon: <FaHeadset className="h-8 w-8 text-primary-600" />,
      title: "24/7 Support",
      description: "Our customer service team is available around the clock to assist you."
    }
  ];

  const popularDestinations = [
    { city: "New York", code: "NYC", price: "$299" },
    { city: "Los Angeles", code: "LAX", price: "$399" },
    { city: "London", code: "LHR", price: "$599" },
    { city: "Paris", code: "CDG", price: "$549" },
    { city: "Tokyo", code: "NRT", price: "$799" },
    { city: "Dubai", code: "DXB", price: "$699" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Flight
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Book flights to destinations worldwide with the best prices and service
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                      From
                    </label>
                    <input
                      type="text"
                      name="origin"
                      value={searchData.origin}
                      onChange={handleInputChange}
                      placeholder="City or Airport"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                      To
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={searchData.destination}
                      onChange={handleInputChange}
                      placeholder="City or Airport"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {/* Departure Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                      Departure
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={searchData.departureDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {/* Return Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                      Return
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={searchData.returnDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUsers className="inline h-4 w-4 mr-1" />
                      Passengers
                    </label>
                    <select
                      name="passengers"
                      value={searchData.passengers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      name="class"
                      value={searchData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
                  >
                    <FaSearch className="h-5 w-5 mr-2" />
                    Search Flights
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FlightBook?
            </h2>
            <p className="text-lg text-gray-600">
              We provide the best flight booking experience with competitive prices and excellent service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing places around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {destination.city}
                      </h3>
                      <p className="text-gray-600">{destination.code}</p>
                    </div>
                    <FaPlane className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">
                      {destination.price}
                    </span>
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join thousands of satisfied customers who trust us with their travel needs
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Search Flights Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
