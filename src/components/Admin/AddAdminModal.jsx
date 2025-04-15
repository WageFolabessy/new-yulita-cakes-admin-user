import { useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types';
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const AddAdminModal = ({ isOpen, onClose, onAdminAdded }) => {
  const { authFetch } = useContext(AppContext);
  const initialFormState = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (e.target.name === 'password' || e.target.name === 'password_confirmation') {
         setErrors({ ...errors, password: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.password_confirmation) {
      setErrors({ ...errors, password: ["Konfirmasi password tidak cocok."] });
      toast.warn("Konfirmasi password tidak cocok.");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };

    setLoading(true);
    setErrors({});

    try {
      // Gunakan endpoint POST yang benar
      const response = await authFetch("/admin/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Gagal menambahkan admin.");
      } else {
        toast.success(data.message || "Admin berhasil ditambahkan.");
        if (onAdminAdded && data.user) {
          onAdminAdded(data.user);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error adding admin:", error);
       if (error.message !== 'Unauthorized') {
           toast.error("Terjadi kesalahan jaringan saat menambahkan admin.");
       }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Admin Baru">
      <form onSubmit={handleSubmit} noValidate>
        {/* Nama */}
        <div className="mb-4">
          <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          <input
            id="add-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400 focus:border-pink-400'} ${loading ? 'bg-gray-100' : ''}`}
          />
          {errors.name && errors.name.map((error, index) => (
            <p key={index} className="text-red-600 text-xs mt-1">{error}</p>
          ))}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Email
          </label>
          <input
            id="add-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400 focus:border-pink-400'} ${loading ? 'bg-gray-100' : ''}`}
          />
           {errors.email && errors.email.map((error, index) => (
             <p key={index} className="text-red-600 text-xs mt-1">{error}</p>
           ))}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="add-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="add-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
             className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400 focus:border-pink-400'} ${loading ? 'bg-gray-100' : ''}`}
          />
           {errors.password && errors.password.map((error, index) => (
             <p key={index} className="text-red-600 text-xs mt-1">{error}</p>
           ))}
        </div>

        {/* Konfirmasi Password */}
        <div className="mb-6">
          <label htmlFor="add-password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            Konfirmasi Password
          </label>
          <input
            id="add-password_confirmation"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            disabled={loading}
             className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400 focus:border-pink-400'} ${loading ? 'bg-gray-100' : ''}`}
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
            {loading ? "Menyimpan..." : "Simpan Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdminAdded: PropTypes.func.isRequired,
};


export default AddAdminModal;