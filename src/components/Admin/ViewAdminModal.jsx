import React from "react"; // Hanya perlu React
import PropTypes from "prop-types";
import Modal from "../Modal"; // Pastikan path benar

// Menampilkan data langsung dari prop 'admin'
const ViewAdminModal = ({ isOpen, onClose, admin }) => {
  // Jangan render jika modal tidak open atau tidak ada data admin
  if (!isOpen || !admin) {
    return null;
  }

  // Format tanggal (bisa diekstrak ke helper jika dipakai di banyak tempat)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long", // Nama bulan lengkap
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return "Tanggal tidak valid";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Admin: ${admin.name}`}
    >
      <div className="space-y-4 text-sm sm:text-base">
        {" "}
        {/* Ukuran teks disesuaikan */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            ID Admin
          </p>
          <p className="text-gray-900">{admin.id ?? "-"}</p>{" "}
          {/* Tampilkan ID */}
        </div>
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Nama Lengkap
          </p>
          <p className="text-gray-900">{admin.name ?? "-"}</p>
        </div>
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Alamat Email
          </p>
          <p className="text-gray-900">{admin.email ?? "-"}</p>
        </div>
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Tanggal Dibuat
          </p>
          <p className="text-gray-900">{formatDate(admin.created_at)}</p>
        </div>
        {/* Tambahkan detail lain jika ada di objek 'admin' */}
      </div>
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        {" "}
        {/* Tombol tutup dipisah */}
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

// Definisi PropTypes
ViewAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.shape({
    // Tidak isRequired agar bisa null awalnya
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
    created_at: PropTypes.string, // atau PropTypes.instanceOf(Date) jika sudah Date object
    // Tambahkan properti lain jika perlu
  }),
};

export default ViewAdminModal;
