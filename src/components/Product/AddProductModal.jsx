import React, { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const { authFetch } = useContext(AppContext);

  const initialFormState = {
    product_name: "",
    category_id: "",
    original_price: "",
    sale_price: "",
    stock: "",
    weight: "",
    description: "",
    label: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true); // Tampilkan loading saat fetch kategori
    try {
      const response = await authFetch("/admin/category");
      if (!response.ok) throw new Error("Gagal memuat kategori");
      const result = await response.json();
      setCategories(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Gagal memuat daftar kategori.");
      setCategories([]);
    } finally {
      setLoading(false); // Selesai loading fetch kategori
    }
  }, [isOpen, authFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    let currentPreviews = [];
    if (!isOpen) {
      currentPreviews = imagePreviews;
      setFormData(initialFormState);
      setImageFiles([]);
      setImagePreviews([]);
      setErrors({});
      setLoading(false);
    }
    return () => {
      currentPreviews.forEach(URL.revokeObjectURL);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [imagePreviews]);

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

  const handleDescriptionChange = useCallback(
    (value) => {
      setFormData((prev) => ({ ...prev, description: value || "" }));
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: null }));
      }
    },
    [errors]
  );

  const handleImageChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      imagePreviews.forEach(URL.revokeObjectURL);

      setImageFiles(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);

      const imageErrors = errors.images || errors["images.0"];
      if (imageErrors) {
        setErrors((prev) => ({ ...prev, images: null, "images.0": null }));
      }
    },
    [imagePreviews, errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrors({});

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend.append(key, value ?? "");
    });
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        dataToSend.append("images[]", file);
      });
    } else {
      // Jika gambar wajib, tambahkan validasi frontend atau biarkan backend handle
      // dataToSend.append('images', ''); // Opsional: kirim value kosong jika backend perlu
    }

    try {
      const response = await authFetch("/admin/product", {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422 && result.errors) {
          setErrors(result.errors);
          // Fokus ke field pertama yang error (opsional)
          const firstErrorField = Object.keys(result.errors)[0];
          const inputElement = document.getElementById(
            `add-prod-${firstErrorField}`
          );
          inputElement?.focus();
          toast.error(result.message || "Data yang dimasukkan tidak valid.");
        } else {
          toast.error(result.message || "Gagal menambahkan produk.");
        }
      } else {
        toast.success(result.message || "Produk berhasil ditambahkan.");
        if (onProductAdded && result.product) {
          onProductAdded(result.product);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Gagal menghubungi server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Produk Baru">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="add-prod-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Produk
            </label>
            <input
              id="add-prod-name"
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nama Produk"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.product_name
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.product_name &&
              errors.product_name.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
          <div>
            <label
              htmlFor="add-prod-cat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori
            </label>
            <select
              id="add-prod-cat"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loading || categories.length === 0}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.category_id
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${
                loading || categories.length === 0
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">
                {loading && categories.length === 0
                  ? "Memuat..."
                  : "Pilih Kategori..."}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {errors.category_id &&
              errors.category_id.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="add-prod-origprice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Asli (Rp)
            </label>
            <input
              id="add-prod-origprice"
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
              placeholder="50000"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.original_price
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.original_price &&
              errors.original_price.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
          <div>
            <label
              htmlFor="add-prod-saleprice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Diskon (Rp)
            </label>
            <input
              id="add-prod-saleprice"
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              min="0"
              disabled={loading}
              placeholder="45000 (kosongkan jika tidak diskon)"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.sale_price
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.sale_price &&
              errors.sale_price.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="add-prod-stock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stok
            </label>
            <input
              id="add-prod-stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
              placeholder="100"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.stock
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.stock &&
              errors.stock.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
          <div>
            <label
              htmlFor="add-prod-weight"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Berat (gram)
            </label>
            <input
              id="add-prod-weight"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="0"
              step="any"
              disabled={loading}
              placeholder="500"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.weight
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.weight &&
              errors.weight.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
          <div>
            <label
              htmlFor="add-prod-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Label (Opsional)
            </label>
            <input
              id="add-prod-label"
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              disabled={loading}
              placeholder="Misal: Baru"
              maxLength="50"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.label
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-pink-400 focus:border-pink-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.label &&
              errors.label.map((err, i) => (
                <p key={i} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="add-prod-desc"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Deskripsi
          </label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={handleDescriptionChange}
            readOnly={loading}
            className={`bg-white rounded-md border ${
              errors.description
                ? "border-red-500 quill-error"
                : "border-gray-300"
            } ${loading ? "opacity-50" : ""}`}
          />
          {errors.description &&
            errors.description.map((err, i) => (
              <p key={i} className="text-red-600 text-xs mt-1">
                {err}
              </p>
            ))}
        </div>

        <div>
          <label
            htmlFor="add-prod-images"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Gambar Produk (Bisa > 1)
          </label>
          <input
            id="add-prod-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 ${
              loading ? "cursor-not-allowed" : ""
            } ${
              errors.images || errors["images.0"]
                ? "ring-1 ring-red-500 rounded-md"
                : ""
            }`}
          />
          {errors.images &&
            errors.images.map((err, i) => (
              <p key={i} className="text-red-600 text-xs mt-1">
                {err}
              </p>
            ))}
          {Object.keys(errors)
            .filter((key) => key.startsWith("images."))
            .map((key) =>
              errors[key].map((err, i) => (
                <p key={`${key}-${i}`} className="text-red-600 text-xs mt-1">
                  {err}
                </p>
              ))
            )}

          {imagePreviews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {imagePreviews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200 shadow-sm"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition ${
              loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProductAdded: PropTypes.func.isRequired,
};

export default AddProductModal;
