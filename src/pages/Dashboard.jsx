import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import SummaryCard from "../components/Dashboard/SummaryCard";
import SalesChart from "../components/Dashboard/SalesChart";
import OrdersChart from "../components/Dashboard/OrdersChart";
import RecentOrders from "../components/Dashboard/RecentOrders";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaBoxOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { authFetch } = useContext(AppContext);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Yulita Cakes | Dasbor";
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await authFetch("/api/admin/dashboard/summary", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Gagal memuat data rangkuman");
      }
      const data = await response.json();
      setSummary({
        totalSales: Number(data.totalSales),
        totalOrders: data.totalOrders,
        totalUsers: data.totalUsers,
        totalProducts: data.totalProducts,
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      toast.error("Terjadi kesalahan saat memuat data Dasbor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dasbor</h1>
        <div className="text-center text-gray-500">Memuat Dasbor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dasbor</h1>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SummaryCard
    title="Total Penjualan"
    value={`Rp ${summary.totalSales.toLocaleString("id-ID")}`}
    icon={<FaMoneyBillWave className="w-10 h-10 text-pink-500" />}
    className="bg-pink-100 border border-pink-300 shadow-lg hover:shadow-xl transition-shadow"
  />
  <SummaryCard
    title="Total Pesanan"
    value={summary.totalOrders}
    icon={<FaShoppingCart className="w-10 h-10 text-yellow-500" />}
    className="bg-yellow-100 border border-yellow-300 shadow-lg hover:shadow-xl transition-shadow"
  />
  <SummaryCard
    title="Total Pengguna"
    value={summary.totalUsers}
    icon={<FaUsers className="w-10 h-10 text-purple-500" />}
    className="bg-purple-100 border border-purple-300 shadow-lg hover:shadow-xl transition-shadow"
  />
  <SummaryCard
    title="Total Produk"
    value={summary.totalProducts}
    icon={<FaBoxOpen className="w-10 h-10 text-teal-500" />}
    className="bg-teal-100 border border-teal-300 shadow-lg hover:shadow-xl transition-shadow"
  />
</div>


      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <SalesChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <OrdersChart />
        </div>
      </div>

      {/* Pesanan Terbaru */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <RecentOrders />
      </div>
    </div>
  );
};

export default Dashboard;
