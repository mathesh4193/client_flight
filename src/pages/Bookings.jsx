import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await bookingsAPI.getAll(user.token);
      setBookings(res.data.bookings);
    };
    fetchBookings();
  }, [user.token]);

  return (
    <div className="container">
      <h1>My Bookings</h1>
      {bookings.map((b) => (
        <div key={b._id} className="booking-card">
          <p>{b.flight.airline} ({b.flight.flightNumber})</p>
          <p>{b.passengers} passengers, {b.cabinClass}</p>
          <p>Total Price: RS {b.totalPrice}</p>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
