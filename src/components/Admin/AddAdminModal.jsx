import { useState, useContext } from "react";
import Modal from "../Modal";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const AddAdminModal = ({ isOpen, onClose, setAdmins }) => {
  const { authFetch } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handler untuk perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Siapkan payload dengan key password_confirmation
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    setLoading(true);
    try {
      const response = await authFetch("/api/admin/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        toast.error("Terjadi kesalahan saat menambahkan admin.");
      } else {
        const data = await response.json();
        // Karena API hanya mengembalikan pesan, kita buat objek admin dummy untuk state
        const newAdmin = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          created_at: new Date()
            .toISOString()
            .slice(0, 16)
            .replace("T", " "),
        };

        setAdmins((prevAdmins) => [...prevAdmins, newAdmin]);
        toast.success(data.message);
        onClose();
        // Reset form dan error
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Admin">
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
        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="Masukkan password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        {/* Konfirmasi Password */}
        <div className="mb-4">
          <label className="block mb-2">Konfirmasi Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="Konfirmasi password"
          />
        </div>
        {/* Tombol */}
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
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAdminModal;
