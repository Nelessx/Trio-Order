import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ContactPage from "./pages/ContactPage/ContactPage";
import AboutPage from "./pages/aboutpage/AboutPage";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUP from "./components/SignUp/SignUP";
import VerifyEmail from "./components/VerifyEmail/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import VerifyPaymentPage from "./pages/VerifyPaymentPage/VerifyPaymentPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import MyOrderPage from "./pages/MyOrderPage/MyOrderPage";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/menu" element={<Menu />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUP />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* payment verification  */}
        <Route path="/myorder/verify" element={<VerifyPaymentPage />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/myorder"
          element={
            <PrivateRoute>
              <MyOrderPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
