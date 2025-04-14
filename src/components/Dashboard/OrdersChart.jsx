import { useState, useEffect, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";


const OrdersChart = () => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdersChartData = async () => {
      try {
        const response = await authFetch("/api/admin/dashboard/orders_data", {
          method: "GET",
        });
        if (!response.ok) throw new Error("Gagal mengambil data Statistik Pesanan");
        const chartData = await response.json();
        setData(chartData);
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan saat mengambil data Statistik Pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersChartData();
  }, [authFetch]);

  if (loading) return <div className="p-4 text-center text-gray-500">Memuat Grafik...</div>;

  return (

    <div className="flex flex-col items-center space-y-6">
  {/* Heading */}
  <h2 className="text-2xl bg-pink-200 text-pink-800 shadow-lg px-6 py-3 rounded-xl font-bold tracking-wide">
    Statistik Pesanan
  </h2>


    <Card className="w-full max-w-3xl bg-pink-100 shadow-xl rounded-2xl p-6 border border-gray-200">
    <CardContent className="p-0">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#374151" }} />
          <YAxis tick={{ fill: "#374151" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}
            formatter={(value) => `${value} orders`}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar dataKey="Orders" fill="#10b981" barSize={40} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  </div>
  );
};

export default OrdersChart;
