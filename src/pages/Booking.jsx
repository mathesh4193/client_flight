import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightsAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { config } from '../config';

const stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);

// Stripe Payment Form Component
const PaymentForm = ({ clientSecret, bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // optional for redirection
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Confirm payment on backend
      await paymentsAPI.confirm({ paymentIntentId: paymentIntent.id });
      onSuccess(paymentIntent.id);
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
};

// Main Booking Component
const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [seatClass, setSeatClass] = useState('economy');
  const [passengers, setPassengers] = useState([{ firstName: '', lastName: '', dateOfBirth: '', gender: 'male' }]);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch flight data
  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await flightsAPI.getById(flightId);
        setFlight(res.data.flight);
      } catch (err) {
        console.error(err);
        setError('Failed to load flight.');
      }
    };
    fetchFlight();
  }, [flightId]);

  // Create booking
  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    if (!flight) return;
    setLoading(true);

    try {
      const totalPrice =
        seatClass === 'economy'
          ? flight.price * passengers.length
          : seatClass === 'business'
          ? flight.price * 1.5 * passengers.length
          : flight.price * 2 * passengers.length;

      const res = await bookingsAPI.create({
        flight: flight._id,
        passengers,
        cabinClass: seatClass,
        totalPrice,
        contactInfo, // send contact info to backend
      });

      const createdBooking = res.data.booking;
      setBooking(createdBooking);

      // Create Stripe payment intent
      const payRes = await paymentsAPI.createIntent({ bookingId: createdBooking._id });
      setClientSecret(payRes.data.clientSecret);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/bookings/${booking._id}`);
  };

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">{error || 'Loading flight…'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{flight.airline} {flight.flightNumber}</h2>
            <p>{flight.origin} → {flight.destination}</p>
            <p>Departure: {new Date(flight.departureDate).toLocaleString()}</p>
            <p>Price(RS):{flight.price}</p>
          </div>

          {!booking && (
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={seatClass}
                  onChange={(e) => setSeatClass(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  required
                  className="w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  required
                  className="w-full border rounded-md p-2"
                />
              </div>

              {error && <p className="text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {loading ? 'Creating booking…' : 'Book & Pay'}
              </button>
            </form>
          )}

          {booking && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} bookingId={booking._id} onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
