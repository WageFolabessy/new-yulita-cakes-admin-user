import { useState, useEffect } from "react";
import Modal from "../Modal";

const PaymentDetailModal = ({ isOpen, onClose, payment, updatePaymentStatus }) => {
  // Jika payment.status adalah "expire", ubah menjadi "expired"
  const getInitialStatus = (status) => (status === "expire" ? "expired" : status);

  const [status, setStatus] = useState(payment ? getInitialStatus(payment.status) : "");

  // Perbarui state status jika data payment berubah
  useEffect(() => {
    if (payment) {
      setStatus(getInitialStatus(payment.status));
    }
  }, [payment]);

  if (!payment) return null;

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = () => {
    updatePaymentStatus(payment.id, status);
    onClose();
  };

  // Fungsi untuk merender detail transaksi berdasarkan metadata
  const renderTransactionDetails = () => {
    if (!payment.metadata) {
      return <p>Tidak ada informasi transaksi.</p>;
    }
    let metadataObj = payment.metadata;
    // Jika metadata berupa string JSON, coba parse menjadi objek
    if (typeof metadataObj === "string") {
      try {
        metadataObj = JSON.parse(metadataObj);
      } catch (e) {
        // Jika gagal parse, tampilkan stringnya apa adanya
      }
    }
    if (typeof metadataObj === "object" && metadataObj !== null) {
      return (
        <div>
          {Object.entries(metadataObj).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>
      );
    }
    return <p>{metadataObj}</p>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pembayaran">
      <div className="space-y-6">
        {/* Informasi Pembayaran */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Pembayaran</h2>
          <p>
            <strong>ID Pembayaran:</strong> {payment.id}
          </p>
          <p>
            <strong>No. Pesanan:</strong> {payment.order?.order_number}
          </p>
          <p>
            <strong>Tanggal:</strong>{" "}
            {new Date(payment.created_at).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">{payment.status}</span>
          </p>
          <p>
            <strong>Jumlah:</strong>{" "}
            Rp{" "}
            {payment.order?.total_amount
              ? payment.order.total_amount.toLocaleString("id-ID")
              : payment.amount.toLocaleString("id-ID")}
          </p>
        </div>
        {/* Informasi Transaksi */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Informasi Transaksi</h2>
          <p>
            <strong>Tipe Pembayaran:</strong> {payment.payment_type}
          </p>
          <p>
            <strong>ID Transaksi:</strong> {payment.transaction_id}
          </p>
          {renderTransactionDetails()}
        </div>
        {/* Ubah Status Pembayaran */}
        <div>
          <label className="block mb-2 font-semibold">
            Ubah Status Pembayaran
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="settlement">Settlement</option>
            <option value="cancel">Cancel</option>
            <option value="expired">Expired</option>
            <option value="deny">Deny</option>
          </select>
        </div>
        {/* Tombol */}
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
            onClick={handleUpdateStatus}
            className="px-5 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Perbarui Status
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDetailModal;
