import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const EditProfileModal = ({
  isOpen,
  onClose,
  currentAdmin,
  onProfileUpdated,
}) => {
  const { authFetch, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentAdmin) {
      setFormData({
        name: currentAdmin.name || "",
        email: currentAdmin.email || "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
    }
  }, [currentAdmin, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      setErrors({ ...errors, password: ["Konfirmasi password tidak cocok."] });
      toast.warn("Konfirmasi password tidak cocok.");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.password) {
      payload.password = formData.password;
      payload.password_confirmation = formData.password_confirmation;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Gagal memperbarui profil.");
        return;
      }

      toast.success(data.message || "Profil berhasil diperbarui.");

      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }
      setUser(data.user);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Terjadi kesalahan jaringan saat memperbarui profil.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentAdmin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil Admin">
      <form onSubmit={handleSubmit} noValidate>
        {" "}
        {/* Nama */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
              errors.name
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
            } ${loading ? "bg-gray-100" : ""}`}
          />
          {errors.name &&
            errors.name.map((error, index) => (
              <p key={index} className="text-red-600 text-xs mt-1">
                {error}
              </p>
            ))}
        </div>
        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
              errors.email
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
            } ${loading ? "bg-gray-100" : ""}`}
          />
          {errors.email &&
            errors.email.map((error, index) => (
              <p key={index} className="text-red-600 text-xs mt-1">
                {error}
              </p>
            ))}
        </div>
        {/* Password Baru */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password Baru (Opsional)
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Kosongkan jika tidak ingin mengubah"
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
            } ${loading ? "bg-gray-100" : ""}`}
          />
          {errors.password &&
            errors.password.map((error, index) => (
              <p key={index} className="text-red-600 text-xs mt-1">
                {error}
              </p>
            ))}
        </div>
        {/* Konfirmasi Password */}
        <div className="mb-6">
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Konfirmasi Password Baru
          </label>
          <input
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            disabled={loading || !formData.password}
            placeholder="Konfirmasi password baru"
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
            } ${loading || !formData.password ? "bg-gray-100" : ""}`}
          />
        </div>
        {/* Tombol Aksi */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition ${
              loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentAdmin: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onProfileUpdated: PropTypes.func.isRequired,
};

export default EditProfileModal;
