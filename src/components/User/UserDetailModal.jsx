import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import "react-quill/dist/quill.snow.css";

const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";

  if (!status || status === "N/A") status = "N/A";
  const lowerStatus = status.toLowerCase();

  switch (lowerStatus) {
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "paid":
    case "settlement":
    case "delivered":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "processing":
    case "shipped":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "cancelled":
    case "deny":
    case "expired":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status.replace("_", " ").toUpperCase()}{" "}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string };

const UserDetailModal = ({ isOpen, onClose, user }) => {
  const { authFetch } = useContext(AppContext);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      return "Invalid Date";
    }
  };
  const formatRupiah = (number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const fetchUserDetails = useCallback(async () => {
    if (!isOpen || !user?.id) return;
    setLoading(true);
    setError(null);
    setDetailedUser(null);
    try {
      const response = await authFetch(`/admin/site_user/${user.id}`);
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          `Gagal memproses response: ${response.statusText || response.status}`
        );
      }
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil detail pengguna");
      }
      if (data && data.data) {
        setDetailedUser(data.data);
      } else {
        throw new Error("Format data detail pengguna tidak dikenali.");
      }
    } catch (err) {
      console.error("Error fetching user detail:", err);
      setError(err.message);
      if (err.message !== "Unauthorized") {
        toast.error(err.message || "Terjadi kesalahan saat mengambil detail.");
      }
    } finally {
      setLoading(false);
    }
  }, [isOpen, user, authFetch]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    if (!isOpen) {
      setDetailedUser(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const renderContent = () => {
    if (loading)
      return (
        <div className="p-4 text-center text-gray-500">
          Memuat detail pengguna...
        </div>
      );
    if (error)
      return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    if (!detailedUser)
      return (
        <div className="p-4 text-center text-gray-500">
          Data detail tidak tersedia.
        </div>
      );

    return (
      <div className="space-y-5 text-sm max-h-[70vh] overflow-y-auto pr-2">
        {/* Informasi Pengguna */}
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Pengguna
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <p>
              <strong>ID:</strong> {detailedUser.id}
            </p>
            <p>
              <strong>Nama:</strong> {detailedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {detailedUser.email}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {detailedUser.is_active ? (
                <StatusBadge status="Aktif" />
              ) : (
                <StatusBadge status="Non-Aktif" />
              )}
            </p>
            <p className="col-span-1 sm:col-span-2">
              <strong>Tanggal Daftar:</strong>{" "}
              {formatDate(detailedUser.created_at)}
            </p>
          </div>
        </section>

        {/* Alamat Pengguna */}
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Alamat Tersimpan
          </h3>
          {detailedUser.addresses && detailedUser.addresses.length > 0 ? (
            <div className="space-y-3">
              {detailedUser.addresses.map((address, index) => (
                <div
                  key={address.id || index}
                  className="p-3 border rounded-md bg-gray-50 text-xs"
                >
                  <p className="font-semibold">
                    {address.recipient_name}{" "}
                    {address.is_default ? (
                      <span className="text-xs font-normal bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        (Utama)
                      </span>
                    ) : (
                      ""
                    )}
                  </p>
                  <p>{address.phone_number}</p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.province}, {address.postal_code}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Tidak ada alamat tersimpan.</p>
          )}
        </section>

        {/* Riwayat Pesanan */}
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Riwayat Pesanan
          </h3>
          {detailedUser.orders && detailedUser.orders.length > 0 ? (
            <div className="overflow-x-auto border rounded-md">
              {" "}
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-gray-600 hidden sm:table-cell">
                      No. Pesanan
                    </th>
                    <th className="py-2 px-3 text-left font-medium text-gray-600">
                      Tanggal
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-600">
                      Total
                    </th>
                    <th className="py-2 px-3 text-center font-medium text-gray-600">
                      Status Order
                    </th>
                    <th className="py-2 px-3 text-center font-medium text-gray-600">
                      Pembayaran
                    </th>
                    <th className="py-2 px-3 text-center font-medium text-gray-600">
                      Pengiriman
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedUser.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-2 px-3 whitespace-nowrap hidden sm:table-cell">
                        {order.order_number}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {formatDate(order.order_date || order.created_at)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right">
                        {formatRupiah(order.total_amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          status={order.status_label || order.status}
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          status={
                            order.payment_status_label || order.payment_status
                          }
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          status={
                            order.shipment_status_label || order.shipment_status
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">Tidak ada riwayat pesanan.</p>
          )}
        </section>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengguna">
      {renderContent()}
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

UserDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default UserDetailModal;
