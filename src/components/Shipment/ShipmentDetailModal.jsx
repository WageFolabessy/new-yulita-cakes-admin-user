import { useState, useEffect } from "react";
import Modal from "../Modal";

const ShipmentDetailModal = ({ isOpen, onClose, shipment, updateShipment }) => {
  const [formData, setFormData] = useState({
    courier: "",
    service: "",
    tracking_number: "",
    status: "",
  });

  // Perbarui formData saat shipment berubah
  useEffect(() => {
    if (shipment) {
      setFormData({
        courier: shipment.courier,
        service: shipment.service,
        tracking_number: shipment.tracking_number || "",
        status: shipment.status,
      });
    }
  }, [shipment]);

  if (!shipment) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateShipment = () => {
    updateShipment(shipment.id, formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengiriman">
      <div className="space-y-6">
        {/* Informasi Pengiriman */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Pengiriman</h2>
          <p>
            <strong>No. Pesanan:</strong> {shipment.order?.order_number}
          </p>
          <p>
            <strong>Nama Pelanggan:</strong> {shipment.order?.user?.name}
          </p>
          <p>
            <strong>Tanggal:</strong> {new Date(shipment.created_at).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </div>
        {/* Form Detail Pengiriman */}
        <div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Kurir</label>
            <input
              type="text"
              name="courier"
              value={formData.courier}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Layanan</label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Nomor Resi</label>
            <input
              type="text"
              name="tracking_number"
              value={formData.tracking_number}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Masukkan nomor resi"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Status Pengiriman</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        {/* Tombol Aksi */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition duration-200"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleUpdateShipment}
            className="px-5 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Perbarui Pengiriman
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShipmentDetailModal;
