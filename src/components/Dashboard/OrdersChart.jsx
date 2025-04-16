import { useState, useEffect, useContext, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrdersChart = () => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrdersChartData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/admin/dashboard/orders_data");
      if (!response.ok) {
        let errorData = { message: "Gagal mengambil data statistik pesanan." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const chartData = await response.json();
      setData(Array.isArray(chartData) ? chartData : []);
    } catch (err) {
      console.error("Error fetching orders chart:", err);
      if (err.message !== "Unauthorized") {
        toast.error(`Error: ${err.message}`);
        setError(err.message);
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchOrdersChartData();
  }, [fetchOrdersChartData]);

  const formatTooltip = useCallback((value) => `${value} Pesanan`, []);

  const renderContent = () => {
    if (loading)
      return (
        <div className="p-4 text-center text-gray-500 h-80 flex items-center justify-center">
          Memuat Statistik Pesanan...
        </div>
      );
    if (error)
      return (
        <div className="p-4 text-center text-red-500 h-80 flex items-center justify-center">
          Error: {error}
        </div>
      );
    if (data.length === 0)
      return (
        <div className="p-4 text-center text-gray-500 h-80 flex items-center justify-center">
          Tidak ada data pesanan untuk ditampilkan.
        </div>
      );

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          {" "}
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: 12,
            }}
            formatter={formatTooltip}
            labelFormatter={(label) => `Bulan: ${label}`}
          />
          <Bar
            dataKey="count"
            name="Jumlah Pesanan"
            fill="#f472b6"
            barSize={30}
            radius={[4, 4, 0, 0]}
          />{" "}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="shadow-lg border border-pink-200 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-pink-800">
          Statistik Pesanan (12 Bulan Terakhir)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0"> {renderContent()}</CardContent>
    </Card>
  );
};

OrdersChart.propTypes = {};

export default OrdersChart;
