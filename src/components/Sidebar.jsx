import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import {
  FaHome, FaThList, FaCubes, FaClipboardList, FaCreditCard,
  FaTruckMoving, FaUserFriends, FaCommentDots, FaChartBar,
  FaUserCog, FaTimes,
} from "react-icons/fa";

const menuItems = [
  { name: "DASBOR", icon: <FaHome />, path: "/dashboard" },
  { name: "KATEGORI", icon: <FaThList />, path: "/categories" },
  { name: "PRODUK", icon: <FaCubes />, path: "/products" },
  { name: "PESANAN", icon: <FaClipboardList />, path: "/orders" },
  { name: "PEMBAYARAN", icon: <FaCreditCard />, path: "/payments" },
  { name: "PENGIRIMAN", icon: <FaTruckMoving />, path: "/shipments" },
  { name: "PENGGUNA", icon: <FaUserFriends />, path: "/users" },
  { name: "ULASAN PRODUK", icon: <FaCommentDots />, path: "/reviews" },
  { name: "LAPORAN", icon: <FaChartBar />, path: "/report" },
  { name: "MANAJEMEN ADMIN", icon: <FaUserCog />, path: "/admins" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Admin Navigation"
        className={`fixed top-0 left-0 bottom-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] z-40 bg-white border-r border-gray-200 shadow-lg w-60
          transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200">
            <h2 className="text-gray-800 text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
              aria-label="Close Sidebar"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (isOpen) { setIsOpen(false); } }}
                className={({ isActive }) =>
                  `flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors ${
                    isActive
                      ? "bg-pink-100 text-pink-700 border-l-4 border-pink-500 font-semibold"
                      : "border-l-4 border-transparent"
                  }`
                }
                end={item.path === "/dashboard"}
              >
                <span className="mr-3 w-5 text-center text-gray-500">
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;