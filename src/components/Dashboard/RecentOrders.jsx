import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const RecentOrders = () => {
  const { authFetch } = useContext(AppContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await authFetch("/api/admin/dashboard/recent_orders", {
          method: "GET",
        });
        if (!response.ok) throw new Error("Gagal mengambil data Orderan terbaru");
        const ordersData = await response.json();
        setRecentOrders(ordersData);
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan saat mengambil data Orderan terbaru");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-4">
        Memuat orderan terbaru...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
  {/* Heading */}
  <h2 className="text-2xl bg-pink-200 text-pink-800 shadow-lg px-6 py-3 rounded-xl font-bold tracking-wide">
    Orderan Terbaru
  </h2>

  {/* Table Container */}
  <div className="w-full max-w-4xl overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-pink-100 text-gray-700">
        <tr>
          <th className="py-4 px-6 text-left font-semibold">No. Pesanan</th>
          <th className="py-4 px-6 text-left font-semibold">Nama Pelanggan</th>
          <th className="py-4 px-6 text-left font-semibold">Tanggal Pesanan</th>
          <th className="py-4 px-6 text-left font-semibold">Total</th>
          <th className="py-4 px-6 text-left font-semibold">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="py-4 px-6">{order.order_number}</td>
              <td className="py-4 px-6">{order.customer}</td>
              <td className="py-4 px-6">{order.date}</td>
              <td className="py-4 px-6 font-semibold text-gray-800">
                Rp {order.total.toLocaleString("id-ID")}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Selesai"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Diproses"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
              Tidak ada pesanan terbaru.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

  );
};

export default RecentOrders;
