import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightsAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { config } from '../config';

const stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);

const PaymentSection = ({ clientSecret, bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // For card wallets etc., no return URL, handle inline
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Try again.');
      setLoading(false);
      return;
    }

    try {
      await paymentsAPI.confirm({ paymentIntentId: paymentIntent.id });
      onSuccess(paymentIntent.id);
    } catch (err) {
      console.error('Confirm payment error:', err);
      setError('Payment confirmation failed on server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
};

const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [seatClass, setSeatClass] = useState('economy');
  const [passenger, setPassenger] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'male' });
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await flightsAPI.getById(flightId);
        setFlight(res.data.flight);
      } catch (err) {
        console.error('Load flight error:', err);
        setError('Failed to load flight');
      }
    };
    load();
  }, [flightId]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const passengers = [{ ...passenger, seatClass }];
      const res = await bookingsAPI.create({ flightId, passengers, contactInfo });
      const created = res.data.booking;
      setBooking(created);

      // Create Stripe Payment Intent
      const payRes = await paymentsAPI.createIntent({ bookingId: created.id });
      setClientSecret(payRes.data.clientSecret);
    } catch (err) {
      console.error('Create booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    // Navigate to booking details page
    if (booking?.id) {
      navigate(`/bookings/${booking.id}`);
    }
  };

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking</h1>
          <p className="text-gray-600">{error || 'Loading flight…'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Flight summary */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{flight.airline} {flight.flightNumber}</h2>
            <p className="text-gray-700">
              {flight.origin?.city} ({flight.origin?.code}) → {flight.destination?.city} ({flight.destination?.code})
            </p>
            <p className="text-gray-600 text-sm">
              Depart: {new Date(flight.departure?.date).toLocaleString()} — Arrive: {new Date(flight.arrival?.date).toLocaleString()}
            </p>
          </div>

          {/* Booking form */}
          {!booking && (
            <form onSubmit={handleCreateBooking} className="space-y-6">
              {/* Seat class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={seatClass}
                  onChange={(e) => setSeatClass(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="economy">Economy — ${flight.pricing?.economy?.basePrice}</option>
                  <option value="business">Business — ${flight.pricing?.business?.basePrice}</option>
                  <option value="first">First — ${flight.pricing?.first?.basePrice}</option>
                </select>
              </div>

              {/* Passenger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => setPassenger({ ...passenger, dateOfBirth: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {creating ? 'Creating booking…' : 'Continue to Payment'}
              </button>
            </form>
          )}

          {/* Payment */}
          {booking && clientSecret && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  Booking reference: <span className="font-semibold">{booking.bookingReference}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Total: <span className="font-semibold">${booking.pricing?.totalPrice} {booking.pricing?.currency}</span>
                </p>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentSection clientSecret={clientSecret} bookingId={booking.id} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
