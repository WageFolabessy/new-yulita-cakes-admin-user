import { useState, useContext } from 'react';
import Modal from '../Modal';
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const DeleteAdminModal = ({ isOpen, onClose, admin, setAdmins }) => {
  const { authFetch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  if (!admin) return null;

  // Handler untuk menghapus admin
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/admin/admin/${admin.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Gagal menghapus admin.");
      } else {
        const data = await response.json();
        toast.success(data.message || "Admin berhasil dihapus.");
        // Hapus admin dari state
        setAdmins((prevAdmins) =>
          prevAdmins.filter((item) => item.id !== admin.id)
        );
        onClose();
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Admin">
      <p className="mb-4">
        Apakah Anda yakin ingin menghapus admin{' '}
        <strong>{admin.name}</strong> dengan email{' '}
        <strong>{admin.email}</strong>?
      </p>
      <div className="text-right">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 mr-2 rounded hover:bg-gray-600 transition duration-200"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          {loading ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAdminModal;
