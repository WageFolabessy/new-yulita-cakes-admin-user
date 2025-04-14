import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const UserDetailModal = ({ isOpen, onClose, user }) => {
  const { authFetch } = useContext(AppContext);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ketika modal dibuka dan terdapat user, fetch detail user dari API
  useEffect(() => {
    if (isOpen && user && user.id) {
      setLoading(true);
      authFetch(`/api/admin/site_user/${user.id}`, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Gagal mengambil detail pengguna");
          }
          return response.json();
        })
        .then((data) => {
          setDetailedUser(data);
        })
        .catch((error) => {
          console.error("Error fetching user detail:", error);
          toast.error("Gagal mengambil detail pengguna.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, user, authFetch]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengguna">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : detailedUser ? (
        <div className="space-y-6">
          {/* Informasi Pengguna */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Informasi Pengguna</h2>
            <p>
              <strong>Nama:</strong> {detailedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {detailedUser.email}
            </p>
            <p>
              <strong>Tanggal Daftar:</strong>{" "}
              {new Date(detailedUser.created_at).toLocaleString("id-ID", {
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
              {detailedUser.is_active ? (
                <span className="text-green-500 font-semibold">Aktif</span>
              ) : (
                <span className="text-red-500 font-semibold">Non-Aktif</span>
              )}
            </p>
          </div>

          {/* Alamat Pengguna */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Alamat</h2>
            {detailedUser.addresses && detailedUser.addresses.length > 0 ? (
              detailedUser.addresses.map((address) => (
                <div key={address.id} className="mb-4 p-4 border rounded">
                  <p>
                    <strong>Penerima:</strong> {address.recipient_name}
                  </p>
                  <p>
                    <strong>Penerima:</strong> {address.phone_number}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {address.address_line1}
                  </p>
                  {address.address_line2 && (
                    <p>
                      <strong>Alamat 2:</strong> {address.address_line2}
                    </p>
                  )}
                  <p>
                    <strong>Kota:</strong> {address.city}
                  </p>
                  <p>
                    <strong>Provinsi:</strong> {address.province}
                  </p>
                  <p>
                    <strong>Kode Pos:</strong> {address.postal_code}
                  </p>
                  <p>
                    <strong>Default:</strong>{" "}
                    {address.is_default ? "Ya" : "Tidak"}
                  </p>
                </div>
              ))
            ) : (
              <p>Tidak ada alamat.</p>
            )}
          </div>

          {/* Riwayat Pesanan */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Riwayat Pesanan</h2>
            {detailedUser.orders && detailedUser.orders.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">No. Pesanan</th>
                    <th className="py-2 px-4 text-left">Tanggal</th>
                    <th className="py-2 px-4 text-left">Total</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedUser.orders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2 px-4">{order.order_number}</td>
                      <td className="py-2 px-4">
                        {new Date(order.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="py-2 px-4">
                        Rp {order.total_amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-4 capitalize">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Tidak ada riwayat pesanan.</p>
            )}
          </div>

          {/* Tombol */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Data pengguna tidak ditemukan.
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;
