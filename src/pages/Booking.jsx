import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { flightsAPI, bookingsAPI, paymentsAPI } from "../services/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";

// Stripe Payment Form
const PaymentForm = ({ clientSecret, bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!elements) return;
    try {
      const paymentElement = elements.getElement(PaymentElement);
      if (paymentElement && typeof paymentElement.on === "function") {
        paymentElement.on("loaderror", (ev) => {
          const message = ev?.error?.message || "Payment form failed to load.";
          setError(message);
        });
      }
    } catch (_) {}
  }, [elements]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setError("Payment form is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await paymentsAPI.confirm({
          paymentIntentId: paymentIntent.id,
          bookingId,
        });
        onSuccess(paymentIntent.id);
      } else {
        setError("Payment incomplete or failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <PaymentElement onReady={() => setIsReady(true)} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading || !isReady}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
};

// Main Booking Component
const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [seatClass, setSeatClass] = useState("economy");
  const [passengers, setPassengers] = useState([
    { firstName: "", lastName: "", dateOfBirth: "", gender: "male" },
  ]);
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripePromise, setStripePromise] = useState(null);

  // UPI Payment state
  const [upiId, setUpiId] = useState("");
  const [upiProcessing, setUpiProcessing] = useState(false);
  const [upiMessage, setUpiMessage] = useState("");

  useEffect(() => {
    if (user) {
      setContactInfo({
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Load Stripe publishable key
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/config/stripe-publishable");
        const data = await res.json();
        if (mounted && data?.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
          return;
        }
      } catch (err) {}
      if (mounted && config.STRIPE_PUBLISHABLE_KEY) {
        setStripePromise(loadStripe(config.STRIPE_PUBLISHABLE_KEY));
      }
    })();
    return () => (mounted = false);
  }, []);

  // Fetch flight
  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await flightsAPI.getById(flightId);
        setFlight(res.data.flight);
      } catch (err) {
        console.error(err);
        setError("Failed to load flight details.");
      }
    };
    fetchFlight();
  }, [flightId]);

  const addPassenger = () => {
    setPassengers([...passengers, { firstName: "", lastName: "", dateOfBirth: "", gender: "male" }]);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    setPassengers(updated);
  };

  const removePassenger = (index) => setPassengers(passengers.filter((_, i) => i !== index));

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!flight) return;
    setLoading(true);
    setError("");

    try {
      const totalPrice =
        seatClass === "economy"
          ? flight.price * passengers.length
          : seatClass === "business"
          ? flight.price * 1.5 * passengers.length
          : flight.price * 2 * passengers.length;

      const res = await bookingsAPI.create({
        flightId: flight._id,
        passengers,
        cabinClass: seatClass,
        totalPrice,
        contactInfo,
      });

      const createdBooking = res.data.booking;
      setBooking(createdBooking);

      // Stripe Payment Intent
      const payRes = await paymentsAPI.createIntent({
        bookingId: createdBooking._id,
        paymentMethod: "credit_card",
      });
      if (payRes.data?.clientSecret) setClientSecret(payRes.data.clientSecret);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => navigate(`/bookings/${booking._id}`);

  // UPI Payment handler
  const handleUpiPayment = async () => {
    if (!upiId) return setUpiMessage("Enter a valid UPI ID.");
    setUpiProcessing(true);
    setUpiMessage("");

    try {
      await paymentsAPI.payWithUPI({ bookingId: booking._id, upiId });
      setBooking((prev) => ({ ...prev, paymentStatus: "paid" }));
      setUpiMessage("Payment successful ✅");
    } catch (err) {
      console.error(err);
      setUpiMessage("Payment failed. Try again.");
    } finally {
      setUpiProcessing(false);
    }
  };

  if (!flight)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">{error || "Loading flight…"}</p>
      </div>
    );

  const totalPrice =
    seatClass === "economy"
      ? flight.price * passengers.length
      : seatClass === "business"
      ? flight.price * 1.5 * passengers.length
      : flight.price * 2 * passengers.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Flight Info */}
        <div>
          <h2 className="text-xl font-semibold">
            {flight.airline} {flight.flightNumber}
          </h2>
          <p>
            {flight.origin} → {flight.destination}
          </p>
          <p>Departure: {new Date(flight.departureDate).toLocaleString()}</p>
          <p>Base Price: ₹{flight.price}</p>
        </div>

        {/* Booking Form */}
        {!booking && (
          <form onSubmit={handleBooking} className="space-y-6">
            {/* Seat Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Class</label>
              <select value={seatClass} onChange={(e) => setSeatClass(e.target.value)} className="w-full border rounded-md p-2">
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>

            {/* Passengers */}
            <div>
              <h3 className="font-semibold text-gray-800">Passengers</h3>
              {passengers.map((p, idx) => (
                <div key={idx} className="border p-3 rounded-md mt-2 space-y-2">
                  <input type="text" placeholder="First Name" value={p.firstName} onChange={(e) => handlePassengerChange(idx, "firstName", e.target.value)} className="w-full border rounded-md p-2" required />
                  <input type="text" placeholder="Last Name" value={p.lastName} onChange={(e) => handlePassengerChange(idx, "lastName", e.target.value)} className="w-full border rounded-md p-2" required />
                  <input type="date" value={p.dateOfBirth} onChange={(e) => handlePassengerChange(idx, "dateOfBirth", e.target.value)} className="w-full border rounded-md p-2" required />
                  <select value={p.gender} onChange={(e) => handlePassengerChange(idx, "gender", e.target.value)} className="w-full border rounded-md p-2">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {passengers.length > 1 && <button type="button" onClick={() => removePassenger(idx)} className="text-red-500 text-sm">Remove Passenger</button>}
                </div>
              ))}
              <button type="button" onClick={addPassenger} className="mt-2 bg-gray-200 px-3 py-1 rounded-md">+ Add Passenger</button>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-800">Contact Info</h3>
              <input type="email" placeholder="Email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} className="w-full border rounded-md p-2 mt-1" required />
              <input type="tel" placeholder="Phone" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} className="w-full border rounded-md p-2 mt-2" required />
            </div>

            {/* Summary */}
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-semibold">Total Passengers: {passengers.length}</p>
              <p className="font-semibold">Total Amount: ₹{totalPrice.toFixed(2)}</p>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {loading ? "Creating booking…" : "Confirm Booking"}
            </button>
          </form>
        )}

        {/* Stripe Payment */}
        {booking && clientSecret && stripePromise && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Booking Confirmed — Pay with Card</h3>
            <p>Booking ID: {booking._id}</p>
            <p>Total: ₹{booking.totalPrice}</p>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} bookingId={booking._id} onSuccess={handlePaymentSuccess} />
            </Elements>
          </div>
        )}

        {/* UPI Payment */}
        {booking && booking.paymentStatus !== "paid" && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800">Or Pay via UPI</h3>
            <input type="text" placeholder="Enter UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full border rounded-md p-2" />
            <button onClick={handleUpiPayment} disabled={upiProcessing} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {upiProcessing ? "Processing…" : "Pay via UPI"}
            </button>
            {upiMessage && <p className="text-green-600 text-center">{upiMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
