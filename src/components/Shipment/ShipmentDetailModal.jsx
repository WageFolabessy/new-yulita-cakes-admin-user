import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import StatusBadge from "@/components/Shipment/StatusBadge";

const SHIPMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const ShipmentDetailModal = ({
  isOpen,
  onClose,
  shipment,
  onUpdateShipment,
}) => {
  const [formData, setFormData] = useState({
    tracking_number: "",
    status: "",
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && shipment) {
      setFormData({
        tracking_number: shipment.tracking_number || "",
        status: shipment.status || "",
      });
      setErrors({});
      setLoadingUpdate(false);
    }
    if (!isOpen) {
      setFormData({ tracking_number: "", status: "" });
      setErrors({});
      setLoadingUpdate(false);
    }
  }, [isOpen, shipment]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const handleUpdateClick = useCallback(async () => {
    if (!shipment || loadingUpdate) return;

    const dataToUpdate = {
      status: formData.status,
      tracking_number: formData.tracking_number || null,
    };

    setLoadingUpdate(true);
    setErrors({});

    const success = await onUpdateShipment(shipment.id, dataToUpdate);
    setLoadingUpdate(false);

    if (success) {
      onClose();
    }
  }, [shipment, formData, onUpdateShipment, onClose, loadingUpdate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (!isOpen || !shipment) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pengiriman: #${shipment.order?.order_number || "N/A"}`}
    >
      <div className="space-y-5 text-sm max-h-[75vh] overflow-y-auto pr-2">
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Pesanan & Pelanggan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <p>
              <strong>No. Pesanan:</strong>{" "}
              {shipment.order?.order_number || "-"}
            </p>
            <p>
              <strong>Pelanggan:</strong> {shipment.order?.user?.name || "-"}
            </p>
            <p>
              <strong>Tanggal Update Terakhir:</strong>{" "}
              {formatDate(shipment.updated_at)}
            </p>
            <p>
              <strong>Status Pembayaran:</strong>{" "}
              <StatusBadge
                status={
                  shipment.payment_status_label || shipment.payment_status
                }
              />
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Pengiriman
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <p>
              <strong>ID Pengiriman:</strong> {shipment.id}
            </p>
            <p>
              <strong>Kurir:</strong>{" "}
              <span className="uppercase">{shipment.courier || "-"}</span>
            </p>
            <p className="sm:col-span-2">
              <strong>Layanan:</strong> {shipment.service || "-"}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Update Pengiriman
          </h3>
          <div className="space-y-3">
            {/* Nomor Resi */}
            <div>
              <label
                htmlFor={`shipment-tracking-${shipment.id}`}
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Nomor Resi
              </label>
              <input
                id={`shipment-tracking-${shipment.id}`}
                type="text"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleChange}
                disabled={loadingUpdate}
                placeholder="Masukkan nomor resi"
                className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-1 transition text-sm ${
                  errors.tracking_number
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                } ${loadingUpdate ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.tracking_number &&
                errors.tracking_number.map((err, i) => (
                  <p key={i} className="text-red-600 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            {/* Status Pengiriman */}
            <div>
              <label
                htmlFor={`shipment-status-${shipment.id}`}
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Status Pengiriman
              </label>
              <div className="flex items-center gap-3">
                <select
                  id={`shipment-status-${shipment.id}`}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loadingUpdate}
                  className={`flex-grow border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none transition bg-white ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } ${loadingUpdate ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  {SHIPMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleUpdateClick}
                  disabled={
                    loadingUpdate ||
                    (formData.status === shipment.status &&
                      formData.tracking_number ===
                        (shipment.tracking_number || ""))
                  }
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition ${
                    loadingUpdate ||
                    (formData.status === shipment.status &&
                      formData.tracking_number ===
                        (shipment.tracking_number || ""))
                      ? "bg-pink-300 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  }`}
                >
                  {loadingUpdate ? "Menyimpan..." : "Update"}
                </button>
              </div>
              {errors.status &&
                errors.status.map((err, i) => (
                  <p key={i} className="text-red-600 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
          </div>
        </section>
      </div>
      {/* Tombol Tutup */}
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={loadingUpdate}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

ShipmentDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  shipment: PropTypes.shape({
    id: PropTypes.number,
    order_id: PropTypes.number,
    courier: PropTypes.string,
    service: PropTypes.string,
    tracking_number: PropTypes.string,
    status: PropTypes.string,
    status_label: PropTypes.string,
    payment_status: PropTypes.string,
    payment_status_label: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    order: PropTypes.shape({
      order_number: PropTypes.string,
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    }),
  }),
  onUpdateShipment: PropTypes.func.isRequired,
};

export default ShipmentDetailModal;
