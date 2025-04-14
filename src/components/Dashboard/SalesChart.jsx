import { useState, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";



const SalesChart = () => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesChartData = async () => {
      try {
        const response = await authFetch("/api/admin/dashboard/sales_data", {
          method: "GET",
        });
        if (!response.ok) throw new Error("Gagal mengambil data Grafik Penjualan");
        const chartData = await response.json();
        setData(chartData);
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan saat mengambil data Grafik Penjualan");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesChartData();
  }, [authFetch]);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">Memuat Grafik Penjualan...</div>
    );

  return (

<div className="flex flex-col items-center space-y-6">
  {/* Heading */}
  <h2 className="text-2xl bg-pink-200 text-pink-800 shadow-lg px-6 py-3 rounded-xl font-bold tracking-wide">
    Grafik Penjualan
  </h2>

  {/* Card Container */}
  <Card className="w-full max-w-3xl bg-pink-100 shadow-xl rounded-2xl p-6 border border-gray-200">
    <CardContent className="p-0">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#374151" }} />
          <YAxis
            tick={{ fill: "#374151" }}
            tickFormatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}
            formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="Sales"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 6, fill: "#2563eb" }}
            activeDot={{ r: 8, fill: "#1e40af", stroke: "#1e40af", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>


  );
};

export default SalesChart;
