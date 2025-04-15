import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const { authFetch } = useContext(AppContext);
  const initialFormState = { category_name: "" };
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setImageFile(null);
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen, imagePreview]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImageFile(null);
        setImagePreview("");
      }
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    },
    [errors, imagePreview]
  );

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrors({});

    const dataToSend = new FormData();
    dataToSend.append("category_name", formData.category_name);
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      const response = await authFetch("/admin/category", {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(result.errors || {});
          toast.error(result.message || "Data tidak valid.");
        } else {
          toast.error(result.message || "Gagal menambahkan kategori.");
        }
      } else {
        toast.success(result.message || "Kategori berhasil ditambahkan.");
        if (onCategoryAdded && result.category) {
          onCategoryAdded(result.category);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Gagal menghubungi server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kategori Baru">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Nama Kategori */}
        <div>
          <label
            htmlFor="add-cat-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Kategori
          </label>
          <input
            id="add-cat-name"
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Misal: Kue Kering"
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
              errors.category_name
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
            } ${loading ? "bg-gray-100" : ""}`}
          />
          {errors.category_name &&
            errors.category_name.map((error, index) => (
              <p key={index} className="text-red-600 text-xs mt-1">
                {error}
              </p>
            ))}
        </div>

        {/* Gambar */}
        <div>
          <label
            htmlFor="add-cat-image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Gambar Kategori
          </label>
          <input
            id="add-cat-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 disabled:opacity-50 ${
              loading ? "cursor-not-allowed" : ""
            }`}
          />
          {errors.image &&
            errors.image.map((error, index) => (
              <p key={index} className="text-red-600 text-xs mt-1">
                {error}
              </p>
            ))}
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Pratinjau"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border border-gray-200 shadow-sm"
              />
            </div>
          )}
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
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCategoryAdded: PropTypes.func.isRequired,
};

export default AddCategoryModal;
