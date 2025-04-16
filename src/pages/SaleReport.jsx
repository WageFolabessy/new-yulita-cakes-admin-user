import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import FilterComponent from "../components/SaleReport/FilterComponent";
import StatusBadge from "@/components/SaleReport/StatusBadge";
import customStyles from "../mod/tableSyles";

const SalesReport = () => {
  const { authFetch } = useContext(AppContext);
  const [salesReports, setSalesReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    document.title = "Yulita Cakes | Laporan Penjualan";
  }, []);

  const formatDate = useCallback((dateStr, options = {}) => {
    if (!dateStr) return "-";
    const defaultOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        ...defaultOptions,
        ...options,
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

  const fetchSalesReports = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    let url = "/admin/reports";
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await authFetch(url);
      if (!response.ok) {
        let errorData = { message: "Gagal memuat data laporan." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(
          errorData.message || `Gagal memuat data (${response.status})`
        );
      }
      const result = await response.json();
      setSalesReports(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching sales reports:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setSalesReports([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, startDate, endDate]);

  useEffect(() => {
    fetchSalesReports();
  }, [fetchSalesReports]);

  const handleFilter = useCallback((e) => {
    setFilterText(e.target.value);
  }, []);
  const handleClear = useCallback(() => {
    if (filterText) {
      setResetPaginationToggle((prev) => !prev);
      setFilterText("");
    }
  }, [filterText]);

  const filteredReports = useMemo(
    () =>
      salesReports.filter((report) => {
        const searchTerm = filterText.toLowerCase();
        return (
          report.order_number?.toLowerCase().includes(searchTerm) ||
          report.product_name?.toLowerCase().includes(searchTerm) ||
          report.customer_name?.toLowerCase().includes(searchTerm) || // Filter by customer
          report.tracking_number?.toLowerCase().includes(searchTerm) // Filter by tracking
        );
      }),
    [salesReports, filterText]
  );

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "50px",
        center: true,
      },
      {
        name: "No. Order",
        selector: (row) => row.order_number,
        sortable: true,
        minWidth: "160px",
        wrap: true,
      },
      {
        name: "Tanggal",
        selector: (row) => row.order_date,
        sortable: true,
        cell: (row) => formatDate(row.order_date),
        minWidth: "140px",
        wrap: true,
      },
      {
        name: "Pelanggan",
        selector: (row) => row.customer_name,
        sortable: true,
        minWidth: "150px",
        wrap: true,
        hide: "md",
      }, // Sembunyikan di mobile
      {
        name: "Produk",
        selector: (row) => row.product_name,
        sortable: true,
        minWidth: "200px",
        wrap: true,
      },
      {
        name: "Qty",
        selector: (row) => row.quantity,
        sortable: true,
        center: true,
        width: "70px",
      },
      {
        name: "Harga Satuan",
        selector: (row) => row.item_price,
        sortable: true,
        cell: (row) => formatRupiah(row.item_price),
        right: true,
        minWidth: "120px",
      },
      {
        name: "Subtotal",
        selector: (row) => row.item_subtotal,
        sortable: true,
        cell: (row) => formatRupiah(row.item_subtotal),
        right: true,
        minWidth: "130px",
      },
      {
        name: "Status Order",
        selector: (row) => row.order_status,
        sortable: true,
        center: true,
        minWidth: "110px",
        cell: (row) => <StatusBadge status={row.order_status} />,
      },
      {
        name: "Pembayaran",
        selector: (row) => row.payment_status,
        sortable: true,
        center: true,
        minWidth: "110px",
        cell: (row) => <StatusBadge status={row.payment_status} />,
      },
      {
        name: "No. Resi",
        selector: (row) => row.tracking_number,
        sortable: false,
        cell: (row) => row.tracking_number || "-",
        minWidth: "140px",
        wrap: true,
        hide: "lg",
      },
    ],
    [formatDate, formatRupiah]
  );

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const marginLeft = 40;
    const headerStartY = 40;
    let startY = headerStartY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Yulita Cakes Pontianak", marginLeft, startY);
    startY += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Laporan Penjualan", marginLeft, startY);
    startY += 15;
    if (startDate && endDate) {
      const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
      const formattedStart = new Date(startDate).toLocaleDateString(
        "id-ID",
        dateOptions
      );
      const formattedEnd = new Date(endDate).toLocaleDateString(
        "id-ID",
        dateOptions
      );
      doc.setFontSize(10);
      doc.text(
        `Periode: ${formattedStart} - ${formattedEnd}`,
        marginLeft,
        startY
      );
      startY += 20;
    } else {
      startY += 10;
    }

    const tableColumn = [
      "No.",
      "No. Order",
      "Tanggal",
      "Pelanggan",
      "Produk",
      "Qty",
      "Harga Satuan",
      "Subtotal",
      "Status Order",
      "Pembayaran",
      "No. Resi",
    ];
    const tableRows = filteredReports.map((report, index) => [
      index + 1,
      report.order_number || "-",
      formatDate(report.order_date, { hour: undefined, minute: undefined }),
      report.customer_name || "-",
      report.product_name || "-",
      report.quantity || "0",
      formatRupiah(report.item_price),
      formatRupiah(report.item_subtotal),
      report.order_status || "-",
      report.payment_status || "-",
      report.tracking_number || "-",
    ]);

    const tableOptions = {
      startY: startY,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [236, 72, 153],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 25 },
        5: { halign: "center", cellWidth: 30 },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "center" },
        9: { halign: "center" },
      },
      styles: { fontSize: 7, cellPadding: 4, valign: "middle" },
      margin: { left: marginLeft, right: marginLeft },
    };

    autoTable(doc, tableOptions);

    // Footer (Nomor Halaman)
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
    }

    const fileName =
      startDate && endDate
        ? `Laporan_Penjualan_${startDate}_sd_${endDate}.pdf`
        : "Laporan_Penjualan.pdf";
    doc.save(fileName);
  }, [filteredReports, startDate, endDate, formatDate, formatRupiah]);

  // --- Render ---
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Laporan Penjualan
      </h1>

      {/* Filter & Download Section */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSalesReports();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end mb-4"
        >
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tanggal Mulai
            </label>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tanggal Selesai
            </label>
            <input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <button
            type="submit"
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition text-sm h-10"
          >
            Filter Tanggal
          </button>
          {/* Tombol Download PDF */}
          <div className="lg:col-start-4 lg:justify-self-end">
            <button
              onClick={downloadPDF}
              disabled={loading || filteredReports.length === 0}
              className="w-full lg:w-auto flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </form>
        {/* Filter Teks */}
        <FilterComponent
          filterText={filterText}
          onFilter={handleFilter}
          onClear={handleClear}
        />
      </div>

      {/* Tabel Laporan */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredReports}
          progressPending={loading} // Gunakan state loading utama
          progressComponent={
            <div className="py-6 text-center text-gray-500">
              Memuat laporan...
            </div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          paginationComponentOptions={{
            rowsPerPageText: "Baris:",
            rangeSeparatorText: "dari",
          }}
          paginationResetDefaultPage={resetPaginationToggle}
          persistTableHead
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
          noDataComponent={
            <div className="p-6 text-center text-gray-500">
              {fetchError
                ? `Gagal memuat data: ${fetchError}`
                : "Tidak ada data laporan untuk periode/filter ini."}
            </div>
          }
        />
      </div>
    </div>
  );
};

SalesReport.propTypes = {};

export default SalesReport;
