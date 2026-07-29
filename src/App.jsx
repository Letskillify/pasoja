import React, { useState, useEffect, lazy, Suspense } from "react";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Home/Footer";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import { StoreProvider } from "./components/StoreProvider";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./pages/Preloader";

// Lazy loaded page components
const Home = lazy(() => import("./components/Homepage/Home"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const Cart = lazy(() => import("./layouts/Cart"));
const Checkout = lazy(() => import("./layouts/Checkout"));
const Wishlist = lazy(() => import("./components/Wishlist"));
const ProductDetail = lazy(() => import("./layouts/ProductDetail"));
const QuickView = lazy(() => import("./components/QuickView"));
const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Shop = lazy(() => import("./pages/Shop"));
const Orders = lazy(() => import("./pages/Orders"));

const RouteLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border border-[#c9a962]/20 border-t-[#c9a962] animate-spin" />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const hideChrome =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/super") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <>
      <ScrollToTop />
      {!hideChrome && <Header />}
      <div className={!hideChrome ? "" : ""}>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop" element={<Shop />} />

            <Route path="/orders" element={<Orders />} />
            {/* <Route path="/benefits" element={<Benefits />} /> */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/quickview" element={<QuickView />} />
          </Routes>
        </Suspense>
      </div>
      {!hideChrome && <Footer />}
    </>
  );
};

function App() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);

  return (
    <>
      {!isPreloaderDone && <Preloader onComplete={() => setIsPreloaderDone(true)} />}
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </>
  );
}

export default App;
