import { useState, useEffect, useContext, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SalesChart = () => {
  const { authFetch } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesChartData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/admin/dashboard/sales_data");
      if (!response.ok) {
        let errorData = { message: "Gagal mengambil data grafik penjualan." };
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
      console.error("Error fetching sales chart:", err);
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
    fetchSalesChartData();
  }, [fetchSalesChartData]);

  const formatRupiahAxis = useCallback(
    (value) => `Rp${(value / 1000000).toFixed(0)} Jt`,
    []
  ); // Format Juta
  const formatRupiahTooltip = useCallback(
    (value) => `Rp ${Number(value).toLocaleString("id-ID")}`,
    []
  );

  const renderContent = () => {
    if (loading)
      return (
        <div className="p-4 text-center text-gray-500 h-80 flex items-center justify-center">
          Memuat Grafik Penjualan...
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
          Tidak ada data penjualan untuk ditampilkan.
        </div>
      );

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 30 }}
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
            tickFormatter={formatRupiahAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: 12,
            }}
            formatter={formatRupiahTooltip}
            labelFormatter={(label) => `Bulan: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Penjualan"
            stroke="#ec4899"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#ec4899" }}
            activeDot={{ r: 6, fill: "#db2777", stroke: "#db2777" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="shadow-lg border border-pink-200 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-pink-800">
          Grafik Penjualan (12 Bulan Terakhir)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0"> {renderContent()}</CardContent>
    </Card>
  );
};

SalesChart.propTypes = {};

export default SalesChart;
