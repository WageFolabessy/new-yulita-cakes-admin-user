import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal"; // Pastikan path benar
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import "react-quill/dist/quill.snow.css";
import StatusBadge from "@/components/Order/StatusBadge"; // Pastikan path benar

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const OrderDetailModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const { authFetch } = useContext(AppContext);
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

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
  const formatRupiah = (number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const fetchOrderDetails = useCallback(async () => {
    if (!isOpen || !order?.id) return;
    setLoadingDetail(true);
    setFetchError(null);
    setDetailedOrder(null);
    try {
      const response = await authFetch(`/admin/orders/${order.id}`);
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          `Gagal memproses response: ${response.statusText || response.status}`
        );
      }
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil detail pesanan");
      }
      if (data && data.data) {
        setDetailedOrder(data.data);
        setSelectedStatus(data.data.status || "");
      } else {
        throw new Error("Format data detail pesanan tidak dikenali.");
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setFetchError(err.message);
      if (err.message !== "Unauthorized") {
        toast.error(err.message || "Terjadi kesalahan saat mengambil detail.");
      }
    } finally {
      setLoadingDetail(false);
    }
  }, [isOpen, order, authFetch]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  useEffect(() => {
    if (!isOpen) {
      setDetailedOrder(null);
      setFetchError(null);
      setLoadingDetail(false);
      setLoadingUpdate(false);
      setSelectedStatus("");
    }
  }, [isOpen]);

  const handleStatusChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
  }, []);

  const handleUpdateStatusClick = useCallback(async () => {
    if (
      !detailedOrder?.id ||
      loadingUpdate ||
      selectedStatus === detailedOrder.status
    )
      return;
    setLoadingUpdate(true);
    const success = await onUpdateStatus(detailedOrder.id, selectedStatus);
    setLoadingUpdate(false);
    if (success) {
      onClose();
    }
  }, [detailedOrder, selectedStatus, onUpdateStatus, onClose, loadingUpdate]);

  const renderContent = () => {
    if (loadingDetail)
      return (
        <div className="p-4 text-center text-gray-500">
          Memuat detail pesanan...
        </div>
      );
    if (fetchError)
      return (
        <div className="p-4 text-center text-red-500">Error: {fetchError}</div>
      );
    if (!detailedOrder)
      return (
        <div className="p-4 text-center text-gray-500">
          Data detail tidak tersedia.
        </div>
      );

    const productTotal =
      (detailedOrder.total_amount ?? 0) - (detailedOrder.shipping_cost ?? 0);
    const hasOrderItems =
      Array.isArray(detailedOrder.order_items) &&
      detailedOrder.order_items.length > 0;

    return (
      <div className="space-y-5 text-sm">
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Pesanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <p>
              <strong>No. Pesanan:</strong> {detailedOrder.order_number || "-"}
            </p>
            <p>
              <strong>Tanggal Pesan:</strong>{" "}
              {formatDate(detailedOrder.order_date || detailedOrder.created_at)}
            </p>
            <p>
              <strong>Status Order:</strong>{" "}
              <StatusBadge
                status={detailedOrder.status_label || detailedOrder.status}
              />
            </p>
            <p>
              <strong>Pembayaran:</strong>{" "}
              <StatusBadge
                status={
                  detailedOrder.payment_status_label ||
                  detailedOrder.payment_status
                }
              />
            </p>
            <p className="sm:col-span-2">
              <strong>Pengiriman:</strong>{" "}
              <StatusBadge
                status={
                  detailedOrder.shipment_status_label ||
                  detailedOrder.shipment_status
                }
              />
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Item Pesanan
          </h3>
          {hasOrderItems ? (
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-gray-600">
                      Produk
                    </th>
                    <th className="py-2 px-3 text-center font-medium text-gray-600">
                      Qty
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-600">
                      Harga Satuan
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-600">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedOrder.order_items.map((item) => (
                    <tr key={item?.id || Math.random()}>
                      <td className="py-2 px-3">
                        {item?.product_name || "N/A"}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item?.qty ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatRupiah(item?.price)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatRupiah(item?.price * item?.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Item pesanan tidak ditemukan.
            </p>
          )}
          {(hasOrderItems || detailedOrder.total_amount > 0) && (
            <div className="flex justify-end mt-3 text-xs">
              <div className="w-full sm:w-1/2 md:w-1/3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal Produk:</span>
                  <span className="font-medium">
                    {formatRupiah(productTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengiriman:</span>
                  <span className="font-medium">
                    {formatRupiah(detailedOrder.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t text-sm">
                  <span>Total Pembayaran:</span>
                  <span>{formatRupiah(detailedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Pelanggan & Pengiriman
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Pelanggan
              </p>
              <p>{detailedOrder.user?.name || "N/A"}</p>
              <p className="text-gray-600">{detailedOrder.user?.email || ""}</p>
            </div>
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Alamat Pengiriman
              </p>
              {detailedOrder.address ? (
                <div className="text-xs leading-snug bg-gray-50 p-2 rounded border border-gray-200">
                  <p className="font-semibold">
                    {detailedOrder.address.recipient_name} (
                    {detailedOrder.address.phone_number})
                  </p>
                  <p>{detailedOrder.address.address_line1}</p>
                  {detailedOrder.address.address_line2 && (
                    <p>{detailedOrder.address.address_line2}</p>
                  )}
                  <p>
                    {detailedOrder.address.city},{" "}
                    {detailedOrder.address.province},{" "}
                    {detailedOrder.address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="italic text-gray-500 text-xs">
                  Alamat tidak tersedia.
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <label
            htmlFor={`order-status-${detailedOrder.id}`}
            className="block mb-1.5 font-semibold text-gray-700 text-sm"
          >
            Ubah Status Pesanan (Order)
          </label>
          <div className="flex items-center gap-3">
            <select
              id={`order-status-${detailedOrder.id}`}
              value={selectedStatus}
              onChange={handleStatusChange}
              disabled={loadingUpdate}
              className={`flex-grow border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none transition bg-white border-gray-300 ${
                loadingUpdate ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
              }`}
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleUpdateStatusClick}
              disabled={
                loadingUpdate || selectedStatus === detailedOrder.status
              }
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition ${
                loadingUpdate || selectedStatus === detailedOrder.status
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              }`}
            >
              {loadingUpdate ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pesanan: #${order?.order_number || "..."}`}
    >
      {renderContent()}
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

OrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.number,
    order_number: PropTypes.string,
  }),
  onUpdateStatus: PropTypes.func.isRequired,
};

export default OrderDetailModal;
