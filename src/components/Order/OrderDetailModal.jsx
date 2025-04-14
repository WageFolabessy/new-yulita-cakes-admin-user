import { useState, useEffect } from "react";
import Modal from "../Modal";

const OrderDetailModal = ({ isOpen, onClose, order, updateOrderStatus }) => {
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = () => {
    // Panggil fungsi updateOrderStatus (async) untuk mengirim update ke backend
    updateOrderStatus(order.id, status);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pesanan">
      <div className="p-6 m-6 space-y-8">
        {/* Informasi Pesanan */}
        <div>
          <h2 className="text-lg font-semibold text-pink-600 mb-4">
            Informasi Pesanan
          </h2>
          <p>
            <strong>No. Pesanan:</strong> {order.order_number}
          </p>
          <p>
            <strong>Tanggal Pesan:</strong>{" "}
            {new Date(order.created_at).toLocaleString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize text-pink-500">{order.status}</span>
          </p>
        </div>

        {/* Item Pesanan */}
        <div>
          <h2 className="text-lg font-semibold text-pink-600 mb-4">
            Item Pesanan
          </h2>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="w-full overflow-x-auto max-h-96 border border-pink-300 rounded-lg bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-pink-100 sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left text-pink-700">
                        Nama Produk
                      </th>
                      <th className="py-3 px-4 text-center text-pink-700">
                        Qty
                      </th>
                      <th className="py-3 px-4 text-right text-pink-700">
                        Harga
                      </th>
                      <th className="py-3 px-4 text-right text-pink-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-200">
                    {order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4">
                          {item.product.product_name}
                        </td>
                        <td className="py-3 px-4 text-center">{item.qty}</td>
                        <td className="py-3 px-4 text-right">
                          Rp {item.price.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Item pesanan tidak tersedia.</p>
          )}

          {/* Total */}
          <div className="flex justify-end mt-4">
            <p className="text-right text-lg font-medium text-pink-700">
              <strong>Total Produk:</strong> Rp{" "}
              {(order.total_amount - order.shipping_cost).toLocaleString(
                "id-ID"
              )}
              <br />
              <strong>Biaya Pengiriman:</strong> Rp{" "}
              {order.shipping_cost.toLocaleString("id-ID")}
              <br />
              <strong>Total Pembayaran:</strong> Rp{" "}
              {order.total_amount.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Informasi Pelanggan */}
        <div>
          <h2 className="text-lg font-semibold text-pink-600 mb-4">
            Informasi Pelanggan
          </h2>
          <p>
            <strong>Penerima:</strong> {order.address?.recipient_name || "N/A"}
          </p>
          <p>
            <strong>Nomor Telepon:</strong>{" "}
            {order.address?.phone_number || "N/A"}
          </p>
          <p>
            <strong>Alamat:</strong> {order.address?.address_line1 || "N/A"},{" "}
            {order.address?.city || "N/A"}, {order.address?.province || "N/A"},{" "}
            {order.address?.postal_code || "N/A"}
          </p>
        </div>

        {/* Ubah Status Pesanan */}
        <div>
          <label className="block mb-2 font-semibold text-pink-700">
            Ubah Status Pesanan
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full border border-pink-300 px-3 py-2 rounded focus:ring focus:ring-pink-300 bg-pink-50"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Tombol */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-400 text-white font-medium hover:bg-gray-500 transition duration-200"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleUpdateStatus}
            className="px-5 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition duration-200"
          >
            Perbarui Status
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
