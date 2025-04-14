import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Modal from "../Modal";
import { toast } from "react-toastify";

const EditAdminModal = ({ isOpen, onClose, admin, setAdmins }) => {
  // Dapatkan authFetch, user (yang sedang login) dan fungsi update user dari context
  const { authFetch, user, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form dan error ketika admin berubah
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
      });
      setErrors({});
    }
  }, [admin]);

  // Handler untuk perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler submit form untuk memperbarui data admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/admin/update_selected_admin/${admin.id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        toast.error("Gagal memperbarui admin.");
        return;
      }

      const updatedAdmin = await response.json();

      // Perbarui daftar admin di state parent
      setAdmins((prevAdmins) =>
        prevAdmins.map((item) =>
          item.id === admin.id ? updatedAdmin : item
        )
      );
      toast.success("Data admin berhasil diperbaharui");

      // Jika admin yang diperbarui adalah admin yang sedang login, perbarui session storage
      if (user && user.id === updatedAdmin.id) {
        setUser(updatedAdmin);
      }

      onClose();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Admin">
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div className="mb-4">
            <label className="block mb-2">Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="Nama Lengkap"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          {/* Tombol */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
            >
              {loading ? "Memperbarui..." : "Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditAdminModal;
