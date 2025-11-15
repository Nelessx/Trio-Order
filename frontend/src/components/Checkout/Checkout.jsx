import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import { useCart } from "../../CartContext/CartContext";
import axios from "axios";

const API_BASE = "http://localhost:4000";

const Checkout = () => {
  const { totalAmount, cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Pre-fill user email if available
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user?.email]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Handle redirects back from Stripe (success or cancel)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");          // backend sets success=true on success_url
    const session_id = params.get("session_id");    // backend provides session_id in success_url
    const payment_status = params.get("payment_status"); // backend uses this only for cancel_url

    // Success flow: /myorder/verify?success=true&session_id=...
    if (success === "true" && session_id) {
      (async () => {
        try {
          setLoading(true);
          setError(null);
          // backend expects session_id as a query param (GET)
          const { data } = await axios.get(
            `${API_BASE}/api/orders/confirm`,
            { params: { session_id }, headers: authHeaders }
          );
          clearCart();
          // if your backend returns the updated order object directly, adjust accordingly
          navigate("/myorder", { state: { order: data } });
        } catch (err) {
          console.error("Payment confirmation error", err);
          setError(
            err.response?.data?.message ||
              "Payment confirmation failed. Please contact support"
          );
        } finally {
          setLoading(false);
        }
      })();
    }

    // Cancel flow: /checkout?payment_status=cancel
    if (payment_status === "cancel") {
      setError("Payment was cancelled or failed. Please contact support");
    }
  }, [location.search, clearCart, navigate, authHeaders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const subtotal = Number(totalAmount.toFixed(2));
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    // Send items in the simplest shape your backend mapper already accepts
    const payload = {
      ...formData,
      subtotal,
      tax,
      total,
      items: cartItems.map(({ item, quantity }) => ({
        name: item.name,
        price: item.price,
        quantity,
        imageUrl: item.imageUrl || "",
      })),
    };

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/orders`,
        payload,
        { headers: authHeaders }
      );

      if (formData.paymentMethod === "online") {
        // backend returns `checkouturl` (all lowercase)
        if (!data.checkouturl) {
          throw new Error("Checkout URL missing from server response");
        }
        window.location.href = data.checkouturl;
      } else {
        // COD flow
        clearCart();
        navigate("/myorder", { state: { order: data.order } });
      }
    } catch (err) {
      console.error("Order submission error", err);
      setError(err.response?.data?.message || "Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(45,27,14)] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/cart"
          className="flex items-center text-amber-400 hover:text-amber-500 transition mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Cart
        </Link>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-amber-400">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
              <Input
                label="Zip Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Payment Detail */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-amber-400">
              Payment Details
            </h2>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="divide-y divide-white/10">
                {cartItems.map(({ _id, item, quantity }) => (
                  <div
                    key={_id}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex gap-2">
                      <span>{item.name}</span>
                      <span className="text-gray-300">x{quantity}</span>
                    </div>
                    <span className="font-medium">
                      ₹{(item.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <PaymentSummary totalAmount={totalAmount} />

            {/* Payment Method */}
            <div>
              <label className="block mb-2 font-semibold">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="" className="text-black">
                  Select Method
                </option>
                <option value="cod" className="text-black">
                  Cash On Delivery
                </option>
                <option value="online" className="text-black">
                  Online Payment
                </option>
              </select>
            </div>

            {error && (
              <p className="text-red-400 font-medium text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-amber-700 hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              <FaLock /> {loading ? "Processing..." : "Complete Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full p-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  </div>
);

const PaymentSummary = ({ totalAmount }) => {
  const subtotal = Number(totalAmount.toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return (
    <div className="space-y-2 bg-white/5 p-4 rounded-lg">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (5%):</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg text-amber-400">
        <span>Total:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default Checkout;