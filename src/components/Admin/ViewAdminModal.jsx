import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Modal from "../Modal";

const ViewAdminModal = ({ isOpen, onClose, admin }) => {
  const { authFetch } = useContext(AppContext);
  const [adminDetail, setAdminDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset detail saat modal ditutup
    if (!isOpen) {
      setAdminDetail(null);
      return;
    }

    // Jika modal terbuka dan ada admin yang dipilih, ambil detail admin dari API
    if (isOpen && admin) {
      setLoading(true);
      authFetch(`/api/admin/show_selected_admin/${admin.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Gagal mengambil detail admin");
          }
          return response.json();
        })
        .then((data) => {
          setAdminDetail(data);
        })
        .catch((error) => {
          console.error("Error fetching admin detail:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, admin, authFetch]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Admin">
      <div className="space-y-6">
        {loading && <p>Loading...</p>}
        {!loading && adminDetail && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Informasi Admin</h2>
            <p>
              <strong>Nama:</strong> {adminDetail.name}
            </p>
            <p>
              <strong>Email:</strong> {adminDetail.email}
            </p>
            <p>
              <strong>Tanggal Dibuat:</strong>{" "}
              {new Date(adminDetail.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
        )}
        {!loading && !adminDetail && (
          <p className="text-gray-500">Data admin tidak ditemukan.</p>
        )}
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
    </Modal>
  );
};

export default ViewAdminModal;
