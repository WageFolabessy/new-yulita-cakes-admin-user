import { useState, useEffect, useContext, useCallback } from "react";
import { AppContext } from "../../context/AppContext"; // Sesuaikan path
import { toast } from "react-toastify";
import StatusBadge from "@/components/Order/StatusBadge"; // Sesuaikan path

const RecentOrders = () => {
  const { authFetch } = useContext(AppContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  }, []);

  const formatRupiah = useCallback((number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/admin/dashboard/recent_orders");
      if (!response.ok) {
        let errorData = { message: "Gagal mengambil pesanan terbaru." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const result = await response.json();
      setRecentOrders(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
      if (err.message !== "Unauthorized") {
        toast.error(`Error: ${err.message}`);
        setError(err.message);
      }
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const renderContent = () => {
    if (loading)
      return (
        <div className="text-center text-gray-500 p-6">
          Memuat pesanan terbaru...
        </div>
      );
    if (error)
      return <div className="text-center text-red-500 p-6">Error: {error}</div>;
    if (recentOrders.length === 0)
      return (
        <div className="text-center text-gray-500 p-6">
          Tidak ada pesanan terbaru untuk ditampilkan.
        </div>
      );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                No. Pesanan
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                Pelanggan
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="py-3 px-4 text-right font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">
                Status Order
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">
                Pembayaran
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">
                Pengiriman
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-800">
                  {order.order_number}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                  {order.user?.name || "-"}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                  {formatDate(order.order_date || order.created_at)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right font-medium text-gray-800">
                  {formatRupiah(order.total_amount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <StatusBadge status={order.status_label || order.status} />
                </td>
                <td className="py-3 px-4 text-center">
                  <StatusBadge
                    status={order.payment_status_label || order.payment_status}
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <StatusBadge
                    status={
                      order.shipment_status_label || order.shipment_status
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Mengganti Card dengan div biasa + styling Tailwind
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Pesanan Terbaru</h2>
      </div>
      <div className="p-4">
        {" "}
        {renderContent()}
      </div>
    </div>
  );
};

RecentOrders.propTypes = {};

export default RecentOrders;
