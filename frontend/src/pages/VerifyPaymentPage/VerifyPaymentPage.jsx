import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyPaymentPage = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [statusMsg, setStatusMsg] = useState("Verifying payment...");

  const token = localStorage.getItem("authToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const params = new URLSearchParams(search);
    const success = params.get("success"); // "true" | "false" | null
    const session_id = params.get("session_id");

    // Case 1: Payment failed or canceled
    if (success !== "true" || !session_id) {
      if (success === "false") {
        setStatusMsg("Payment failed. Redirecting to checkout...");
        setTimeout(() => navigate("/checkout", { replace: true }), 2000);
        return;
      }
      setStatusMsg("Invalid payment session. Please try again.");
      return;
    }

    // Case 2: Stripe success
    axios
      .get("http://localhost:4000/api/orders/confirm", {
        params: { session_id },
        headers: authHeaders,
      })
      .then(() => {
        clearCart();
        setStatusMsg("Payment confirmed! Redirecting to your orders...");
        setTimeout(() => navigate("/myorder", { replace: true }), 2000);
      })
      .catch((err) => {
        console.error("confirmation error:", err);
        setStatusMsg("There was an error confirming your payment. Please contact support.");
        clearCart();
      });
  }, [search, clearCart, navigate, authHeaders]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>{statusMsg}</p>
    </div>
  );
};

export default VerifyPaymentPage;
