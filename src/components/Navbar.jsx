import { useState, useRef, useEffect, useContext } from "react";
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 bg-pink-100 shadow-md h-18 font-cursive">
      <div className="flex items-center justify-between px-6 py-3 h-full">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className=" md:hidden p-2 text-pink-600 hover:text-pink-800 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center flex-1 justify-center md:justify-start">
          <Link to="/">
            <img
              src="/yulita_cake.png"
              className="w-20 transition-transform transform hover:scale-110"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1 text-pink-700 focus:outline-none"
          >
            <span className="text-lg font-semibold uppercase">
              {user?.name || "Cake Lover"}
            </span>

            <FiChevronDown className="w-5 h-5 text-pink-600" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-pink-200">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-pink-700 hover:bg-pink-100"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser className="mr-2" />
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-pink-700 hover:bg-pink-100"
              >
                <FiLogOut className="mr-2" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
