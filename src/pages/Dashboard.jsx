import { useEffect, useState, useContext, useCallback } from "react";
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
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/admin/dashboard/summary");
      if (!response.ok) {
        let errorData = { message: "Gagal memuat data rangkuman." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const data = await response.json();
      setSummary({
        totalSales: Number(data.totalSales) || 0,
        totalOrders: Number(data.totalOrders) || 0,
        totalUsers: Number(data.totalUsers) || 0,
        totalProducts: Number(data.totalProducts) || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      if (err.message !== "Unauthorized") {
        toast.error(`Error: ${err.message}`);
        setError(err.message);
      }
      setSummary({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Dasbor";
    fetchSummary();
  }, [fetchSummary]);

  const formatRupiah = useCallback((number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Dasbor
        </h1>
        <div className="text-center text-gray-500 py-10">
          Memuat Data Dasbor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Dasbor
        </h1>
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          Error memuat data ringkasan: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Dasbor
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <SummaryCard
          title="Total Penjualan"
          value={formatRupiah(summary.totalSales)}
          icon={<FaMoneyBillWave className="w-8 h-8 text-pink-600" />}
          className="bg-pink-50 border border-pink-200 shadow-md hover:shadow-lg transition-shadow"
        />
        <SummaryCard
          title="Total Pesanan"
          value={summary.totalOrders.toLocaleString("id-ID")}
          icon={<FaShoppingCart className="w-8 h-8 text-indigo-600" />}
          className="bg-indigo-50 border border-indigo-200 shadow-md hover:shadow-lg transition-shadow"
        />
        <SummaryCard
          title="Total Pengguna Aktif"
          value={summary.totalUsers.toLocaleString("id-ID")}
          icon={<FaUsers className="w-8 h-8 text-cyan-600" />}
          className="bg-cyan-50 border border-cyan-200 shadow-md hover:shadow-lg transition-shadow"
        />
        <SummaryCard
          title="Total Produk"
          value={summary.totalProducts.toLocaleString("id-ID")}
          icon={<FaBoxOpen className="w-8 h-8 text-amber-600" />}
          className="bg-amber-50 border border-amber-200 shadow-md hover:shadow-lg transition-shadow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
        <SalesChart />
        <OrdersChart />
      </div>

      <RecentOrders />
    </div>
  );
};

Dashboard.propTypes = {};

export default Dashboard;
