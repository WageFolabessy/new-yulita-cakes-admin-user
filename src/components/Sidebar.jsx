import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaThList,
  FaCubes,
  FaClipboardList,
  FaCreditCard,
  FaTruckMoving,
  FaUserFriends,
  FaCommentDots,
  FaChartBar,
  FaUserCog,
  FaTimes,
} from "react-icons/fa";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: "DASBOR", icon: <FaHome />, path: "/" },
    { name: "KATEGORI", icon: <FaThList />, path: "/categories" },
    { name: "PRODUK", icon: <FaCubes />, path: "/products" },
    { name: "PESANAN", icon: <FaClipboardList />, path: "/orders" },
    { name: "PEMBAYARAN", icon: <FaCreditCard />, path: "/payments" },
    { name: "PENGIRIMAN", icon: <FaTruckMoving />, path: "/shipments" },
    { name: "PENGGUNA", icon: <FaUserFriends />, path: "/users" },
    { name: "ULASAN PRODUK", icon: <FaCommentDots />, path: "/reviews" },
    { name: "LAPORAN PENJUALAN", icon: <FaChartBar />, path: "/report" },
    { name: "ADMIN", icon: <FaUserCog />, path: "/admins" },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 md:sticky md:top-16 md:block z-40 bg-pink-100 shadow-lg w-52 
          transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header Mobile */}
          <div className="flex items-center justify-between p-4 md:hidden bg-pink-100">
            <h1 className="text-brown-700 text-lg font-bold">Menu</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-brown-700 hover:text-brown-500 focus:outline-none"
              aria-label="Close Sidebar"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="flex-1 py-4 overflow-y-auto md:w-45 w-full">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-brown-700 hover:bg-pink-200 transition-colors ${
                    isActive ? "bg-pink-200 font-bold text-pink-500" : ""
                  }`
                }
              >
                <span className="mr-4 text-brown-600">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
