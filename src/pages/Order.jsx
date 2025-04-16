import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

import OrderDetailModal from "../components/Order/OrderDetailModal";
import FilterComponent from "../components/Order/FilterComponent";
import StatusBadge from "@/components/Order/StatusBadge";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Order = () => {
  const { authFetch } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/orders"); // Path relatif

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data pesanan." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const result = await response.json();
      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Pesanan";
    fetchOrders();
  }, [fetchOrders]);

  const openDetailModal = useCallback((order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  }, []);

  const handleUpdateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      let success = false;
      try {
        const response = await authFetch(`/admin/orders/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.message || "Gagal memperbarui status pesanan.");
        } else {
          toast.success(
            result.message || "Status pesanan berhasil diperbarui."
          );
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? result.order : order
            )
          );
          success = true;
        }
      } catch (error) {
        console.error("Gagal memperbarui status pesanan:", error);
        if (error.message !== "Unauthorized") {
          toast.error("Terjadi kesalahan jaringan saat update status.");
        }
      }
      return success;
    },
    [authFetch]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.order_number &&
            order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (order.user?.name &&
            order.user.name.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [orders, filterText]
  );

  // -- Sub Header (Filter) --
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

  // -- Helper Format --
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

  // -- DataTable Columns --
  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "60px",
        center: true,
      },
      {
        name: "No. Pesanan",
        selector: (row) => row.order_number,
        sortable: true,
        wrap: true,
        minWidth: "160px",
      },
      {
        name: "Nama Pelanggan",
        selector: (row) => row.user?.name || "-",
        sortable: true,
        wrap: true,
        minWidth: "150px",
      },
      {
        name: "Tanggal",
        selector: (row) => row.order_date || row.created_at,
        sortable: true,
        cell: (row) => formatDate(row.order_date || row.created_at),
        minWidth: "150px",
        wrap: true,
        hide: "md",
      },
      {
        name: "Total",
        selector: (row) => row.total_amount,
        sortable: true,
        cell: (row) => formatRupiah(row.total_amount),
        right: true,
        minWidth: "130px",
      },
      {
        name: "Order",
        sortable: true,
        center: true,
        minWidth: "110px",
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status_label || row.status} />,
      },
      {
        name: "Pembayaran",
        sortable: true,
        center: true,
        minWidth: "150px",
        selector: (row) => row.payment_status,
        cell: (row) => (
          <StatusBadge
            status={row.payment_status_label || row.payment_status}
          />
        ),
      },
      {
        name: "Pengiriman",
        sortable: true,
        center: true,
        minWidth: "150px",
        selector: (row) => row.shipment_status,
        cell: (row) => (
          <StatusBadge
            status={row.shipment_status_label || row.shipment_status}
          />
        ),
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
          Daftar Pesanan
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredOrders}
          progressPending={loadingOrders}
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
          responsive // Penting untuk mobile
          highlightOnHover
          striped
          customStyles={customStyles}
          noDataComponent={
            <div className="p-6 text-center text-gray-500">
              {fetchError
                ? `Gagal memuat data: ${fetchError}`
                : "Belum ada data pesanan."}
            </div>
          }
        />
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
};

Order.propTypes = {};

export default Order;
