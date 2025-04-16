import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

import ShipmentDetailModal from "../components/Shipment/ShipmentDetailModal";
import FilterComponent from "../components/Shipment/FilterComponent";
import StatusBadge from "@/components/Shipment/StatusBadge";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Shipment = () => {
  const { authFetch } = useContext(AppContext);
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoadingShipments(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/shipments"); // Path relatif

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data pengiriman." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const result = await response.json();
      setShipments(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Pengiriman";
    fetchShipments();
  }, [fetchShipments]);

  const openDetailModal = useCallback((shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  }, []);

  const handleUpdateShipment = useCallback(
    async (shipmentId, updatedData) => {
      let success = false;
      try {
        const response = await authFetch(`/admin/shipments/${shipmentId}`, {
          method: "PUT",
          body: JSON.stringify(updatedData), // Kirim data yg diubah (status, tracking_number)
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            Object.values(result.errors)
              .flat()
              .forEach((msg) => toast.error(msg));
            toast.error(result.message || "Data tidak valid.");
          } else {
            toast.error(result.message || "Gagal memperbarui pengiriman.");
          }
        } else {
          toast.success(
            result.message || "Data pengiriman berhasil diperbarui."
          );
          setShipments((prevShipments) =>
            prevShipments.map((shipment) =>
              shipment.id === shipmentId ? result.shipment : shipment
            )
          );
          success = true;
        }
      } catch (error) {
        console.error("Gagal memperbarui pengiriman:", error);
        if (error.message !== "Unauthorized") {
          toast.error("Terjadi kesalahan jaringan saat update.");
        }
      }
      return success;
    },
    [authFetch]
  );

  const filteredShipments = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          (shipment.order?.order_number &&
            shipment.order.order_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.order?.user?.name &&
            shipment.order.user.name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.tracking_number &&
            shipment.tracking_number
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (shipment.courier &&
            shipment.courier.toLowerCase().includes(filterText.toLowerCase())) // Tambah filter kurir
      ),
    [shipments, filterText]
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
        hide: "md",
      },
      {
        name: "Tanggal Update",
        selector: (row) => row.updated_at,
        sortable: true,
        cell: (row) => formatDate(row.updated_at),
        minWidth: "160px",
        wrap: true,
      },
      {
        name: "Kurir/Layanan",
        selector: (row) => row.courier,
        sortable: true,
        cell: (row) => `${row.courier || "-"} (${row.service || "-"})`,
        minWidth: "170px",
        wrap: true,
      },
      {
        name: "No. Resi",
        selector: (row) => row.tracking_number,
        sortable: true,
        cell: (row) => row.tracking_number || "-",
        minWidth: "150px",
        wrap: true,
      },
      {
        name: "Pembayaran",
        sortable: true,
        center: true,
        minWidth: "110px",
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
            title="Lihat Detail / Update"
          >
            <FaEdit className="w-4 h-4" />
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
          Data Pengiriman
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredShipments}
          progressPending={loadingShipments}
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
                : "Belum ada data pengiriman."}
            </div>
          }
        />
      </div>

      <ShipmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        shipment={selectedShipment}
        onUpdateShipment={handleUpdateShipment}
      />
    </div>
  );
};

Shipment.propTypes = {};

export default Shipment;
