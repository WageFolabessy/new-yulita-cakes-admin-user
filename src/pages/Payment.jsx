import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

import PaymentDetailModal from "../components/Payment/PaymentDetailModal";
import FilterComponent from "../components/Payment/FilterComponent";
import StatusBadge from "@/components/Payment/StatusBadge";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Payment = () => {
  const { authFetch } = useContext(AppContext);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/payments"); // Path relatif

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data pembayaran." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const result = await response.json();
      setPayments(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Pembayaran";
    fetchPayments();
  }, [fetchPayments]);

  const openDetailModal = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedPayment(null);
    setIsDetailModalOpen(false);
  }, []);

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          (payment.order?.order_number &&
            payment.order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (payment.order?.user?.name &&
            payment.order.user.name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (payment.transaction_id &&
            payment.transaction_id
              .toLowerCase()
              .includes(filterText.toLowerCase()))
      ),
    [payments, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };
  const formatRupiah = (number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

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
        name: "ID Pembayaran",
        selector: (row) => row.id,
        sortable: true,
        width: "170px",
      },
      {
        name: "No. Pesanan",
        selector: (row) => row.order?.order_number || "-",
        sortable: true,
        wrap: true,
        minWidth: "160px",
      },
      {
        name: "Pelanggan",
        selector: (row) => row.order?.user?.name || "-",
        sortable: true,
        wrap: true,
        minWidth: "150px",
      },
      {
        name: "Tanggal",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => formatDate(row.created_at),
        minWidth: "160px",
        wrap: true,
      },
      {
        name: "Jumlah",
        selector: (row) => row.amount,
        sortable: true,
        cell: (row) => formatRupiah(row.amount),
        right: true,
        minWidth: "130px",
      },
      {
        name: "Tipe",
        selector: (row) => row.payment_type,
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "Status",
        sortable: true,
        center: true,
        minWidth: "110px",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status_label || row.status} />,
      },
      {
        name: "Aksi",
        center: true,
        width: "70px",
        cell: (row) => (
          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [openDetailModal]
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Daftar Pembayaran
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredPayments}
          progressPending={loadingPayments}
          progressComponent={
            <div className="py-6 text-center text-gray-500">Memuat data...</div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 15, 20, 50]}
          paginationComponentOptions={{
            rowsPerPageText: "Baris:",
            rangeSeparatorText: "dari",
          }}
          paginationResetDefaultPage={resetPaginationToggle}
          subHeader
          subHeaderComponent={subHeaderComponent}
          subHeaderAlign="left"
          persistTableHead
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
          noDataComponent={
            <div className="p-6 text-center text-gray-500">
              {fetchError
                ? `Gagal memuat data: ${fetchError}`
                : "Belum ada data pembayaran."}
            </div>
          }
        />
      </div>

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        payment={selectedPayment}
      />
    </div>
  );
};

Payment.propTypes = {};

export default Payment;
