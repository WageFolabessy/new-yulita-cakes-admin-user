import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const EditProfileModal = ({ isOpen, onClose, admin, updateProfile }) => {
  const { authFetch, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Perbarui formData saat data admin berubah
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Siapkan payload untuk update; jika password kosong, jangan dikirim
    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/admin/admin", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        toast.error(errorData.message || "Gagal memperbarui profil.");
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Profil berhasil diperbarui.");

      // Perbarui data profil di halaman dan juga di session storage
      updateProfile(data.user.id, data.user);
      setUser(data.user);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil">
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nama
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
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
          {/* Password Baru */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password Baru
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          {/* Konfirmasi Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Konfirmasi password baru"
            />
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
