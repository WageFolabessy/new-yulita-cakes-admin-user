import { useState, useRef, useEffect, useContext } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { FiChevronDown, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = ({ setIsSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { handleLogout, user } = useContext(AppContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-pink-200 shadow-sm h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-4 md:px-6 h-full">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="md:hidden p-2 text-pink-600 hover:text-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center md:justify-start">
          <Link to="/admin/dashboard" className="flex-shrink-0">
            <img
              src="/yulita_cake.png"
              className="h-10 w-auto transition-transform transform hover:scale-105"
              alt="Yulita Cakes Logo"
            />
          </Link>
        </div>

        <div className="flex-grow"></div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 rounded-md p-1"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <FiUser className="w-5 h-5 text-pink-600" />
            <span className="hidden sm:inline text-sm font-medium">
              {user?.name || "Admin"}
            </span>
            <FiChevronDown
              className={`w-4 h-4 text-pink-600 transition-transform duration-200 ${
                dropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-10">
              <Link
                to="/profile"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser className="mr-2 h-4 w-4" />
                Profil
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700"
              >
                <FiLogOut className="mr-2 h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Navbar;
