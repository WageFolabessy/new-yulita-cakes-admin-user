import { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Order from "./pages/Order";
import Payment from "./pages/Payment";
import Shipment from "./pages/Shipment";
import User from "./pages/User";
import Review from "./pages/Review";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import SalesReport from "./pages/SaleReport";

import Login from "./components/Login";

import { AppContext } from "./context/AppContext";

const App = () => {
  const { token } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer
        autoClose={3000}
        position="top-right"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {token ? (
        <div className="relative min-h-screen md:flex">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <Navbar setIsSidebarOpen={setIsSidebarOpen} />

          <main className="flex-1 mt-16 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Category />} />
              <Route path="/products" element={<Product />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/payments" element={<Payment />} />
              <Route path="/shipments" element={<Shipment />} />
              <Route path="/users" element={<User />} />
              <Route path="/reviews" element={<Review />} />
              <Route path="/report" element={<SalesReport />} />
              <Route path="/admins" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
};

App.propTypes = {};

export default App;
