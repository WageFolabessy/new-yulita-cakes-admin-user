import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { AppContext } from "../../context/AppContext";
import Modal from "../Modal";
import { toast } from "react-toastify";

const EditAdminModal = ({ isOpen, onClose, admin, onAdminUpdated }) => {
  const {
    authFetch,
    user: loggedInUser,
    setUser: setLoggedInUser,
  } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
      });
      setErrors({});
    }
    if (!isOpen) {
      setFormData({ name: "", email: "" });
      setErrors({});
      setLoading(false);
    }
  }, [admin, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admin || loading) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authFetch(`/admin/admin/${admin.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Gagal memperbarui data admin.");
      } else {
        toast.success(data.message || "Data admin berhasil diperbarui.");

        if (onAdminUpdated && data.user) {
          onAdminUpdated(data.user);

          if (loggedInUser && loggedInUser.id === data.user.id) {
            setLoggedInUser(data.user);
          }
        }
        onClose();
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Terjadi kesalahan jaringan saat memperbarui admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Admin: ${admin.name}`}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Nama */}
        <div className="mb-4">
          <label
            htmlFor={`edit-name-${admin.id}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Lengkap
          </label>
          <input
            id={`edit-name-${admin.id}`}
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
        <div className="mb-6">
          <label
            htmlFor={`edit-email-${admin.id}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Alamat Email
          </label>
          <input
            id={`edit-email-${admin.id}`}
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

EditAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  admin: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onAdminUpdated: PropTypes.func.isRequired,
};

export default EditAdminModal;
