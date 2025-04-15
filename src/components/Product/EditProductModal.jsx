import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaTimes } from "react-icons/fa";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const fetchCategories = useCallback(async () => {
    if (!isOpen) return;
    try {
      const response = await authFetch("/admin/category");
      if (!response.ok) throw new Error("Gagal memuat kategori");
      const result = await response.json();
      setCategories(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat daftar kategori.");
      setCategories([]);
    }
  }, [isOpen, authFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    let currentNewPreviews = newImagePreviews;
    if (isOpen && product) {
      setFormData({
        product_name: product.product_name || "",
        category_id: product.category_id || "",
        original_price: product.original_price || "",
        sale_price: product.sale_price ?? "",
        stock: product.stock || "",
        weight: product.weight || "",
        description: product.description || "",
        label: product.label || "",
      });
      setExistingImages(
        product.images?.map((img) => ({ ...img, markedForDeletion: false })) ||
          []
      );
      setImagesToDelete([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setErrors({});
    } else if (!isOpen) {
      setFormData(initialFormState);
      setExistingImages([]);
      setImagesToDelete([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setErrors({});
      setLoading(false);
      // Cleanup previews on close
      currentNewPreviews.forEach(URL.revokeObjectURL);
    }

    return () => {
      currentNewPreviews.forEach(URL.revokeObjectURL);
    };
  }, [isOpen, product]);

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

  const handleNewImageChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      newImagePreviews.forEach(URL.revokeObjectURL);
      setNewImageFiles(files);
      setNewImagePreviews(files.map((file) => URL.createObjectURL(file)));
      const imageErrors = errors.images || errors["images.0"];
      if (imageErrors) {
        setErrors((prev) => ({ ...prev, images: null, "images.0": null }));
      }
    },
    [newImagePreviews, errors]
  );

  const handleMarkForDelete = useCallback((imageId) => {
    setImagesToDelete((prev) => {
      if (prev.includes(imageId)) return prev.filter((id) => id !== imageId);
      else return [...prev, imageId];
    });
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, markedForDeletion: !img.markedForDeletion }
          : img
      )
    );
  }, []);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [newImagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || loading) return;
    setLoading(true);
    setErrors({});

    const dataToSend = new FormData();
    dataToSend.append("_method", "PUT");
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend.append(key, value ?? "");
    });
    if (newImageFiles.length > 0) {
      newImageFiles.forEach((file) => {
        dataToSend.append("images[]", file);
      });
    }
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach((id) => {
        dataToSend.append("imagesToDelete[]", id);
      });
    }

    try {
      const response = await authFetch(`/admin/product/${product.id}`, {
        method: "POST",
        body: dataToSend,
      });
      const result = await response.json();
      console.log(formData);

      if (!response.ok) {
        if (response.status === 422 && result.errors) {
          setErrors(result.errors);
          const firstErrorField = Object.keys(result.errors)[0];
          const inputElement = document.getElementById(
            `edit-prod-${firstErrorField}-${product.id}`
          );
          inputElement?.focus();
          toast.error(result.message || "Data tidak valid.");
        } else {
          toast.error(result.message || "Gagal memperbarui produk.");
        }
      } else {
        toast.success(result.message || "Produk berhasil diperbarui.");
        if (onProductUpdated && result.product) {
          onProductUpdated(result.product);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Gagal menghubungi server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Produk: ${product.product_name}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`edit-prod-name-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Produk
            </label>
            <input
              id={`edit-prod-name-${product.id}`}
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              disabled={loading}
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
              htmlFor={`edit-prod-cat-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori
            </label>
            <select
              id={`edit-prod-cat-${product.id}`}
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
              htmlFor={`edit-prod-origprice-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Asli (Rp)
            </label>
            <input
              id={`edit-prod-origprice-${product.id}`}
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
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
              htmlFor={`edit-prod-saleprice-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Diskon (Rp)
            </label>
            <input
              id={`edit-prod-saleprice-${product.id}`}
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              min="0"
              disabled={loading}
              placeholder="(kosongkan jika tidak diskon)"
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
              htmlFor={`edit-prod-stock-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stok
            </label>
            <input
              id={`edit-prod-stock-${product.id}`}
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
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
              htmlFor={`edit-prod-weight-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Berat (gram)
            </label>
            <input
              id={`edit-prod-weight-${product.id}`}
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="0"
              step="any"
              disabled={loading}
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
              htmlFor={`edit-prod-label-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Label (Opsional)
            </label>
            <input
              id={`edit-prod-label-${product.id}`}
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              disabled={loading}
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
            htmlFor={`edit-prod-desc-${product.id}`}
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

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Gambar Produk Saat Ini
          </label>
          {existingImages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className={`relative border-2 rounded-md p-0.5 transition-opacity ${
                    img.markedForDeletion
                      ? "border-red-400 opacity-50"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`Gambar ${img.id}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleMarkForDelete(img.id)}
                    disabled={loading}
                    className={`absolute -top-2 -right-2 p-1 rounded-full text-xs shadow transition-colors ${
                      img.markedForDeletion
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                    title={
                      img.markedForDeletion ? "Batal Hapus" : "Hapus Gambar Ini"
                    }
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                  {img.is_primary && !img.markedForDeletion && (
                    <span className="absolute bottom-0 left-0 right-0 text-center bg-green-600/80 text-white text-xs py-0.5 rounded-b-sm">
                      Utama
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Tidak ada gambar tersimpan.
            </p>
          )}

          <div className="pt-2">
            <label
              htmlFor={`edit-prod-images-${product.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tambah Gambar Baru (Opsional)
            </label>
            <input
              id={`edit-prod-images-${product.id}`}
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImageChange}
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

            {newImagePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {newImagePreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Preview Baru ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md border border-blue-300 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.number,
    product_name: PropTypes.string,
    category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    original_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sale_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    label: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        image_url: PropTypes.string,
        is_primary: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      })
    ),
  }),
  onProductUpdated: PropTypes.func.isRequired,
};

export default EditProductModal;
