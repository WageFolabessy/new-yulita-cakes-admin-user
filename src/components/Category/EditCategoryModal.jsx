import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const EditCategoryModal = ({ isOpen, onClose, category, setCategories }) => {
  const [formData, setFormData] = useState({
    category_name: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const { authFetch } = useContext(AppContext);

  // Saat props category berubah, inisialisasi form dan preview gambar
  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || "",
      });
      setImagePreview(category.image ? `/storage/${category.image}` : "");
    }
  }, [category]);

  // Handler perubahan input teks
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk perubahan file gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(
        category && category.image ? `http://127.0.0.1:8000/storage/${category.image}` : ""
      );
    }
  };

  // Bersihkan URL blob ketika komponen di-unmount atau gambar diganti
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handler submit menggunakan FormData dengan method spoofing
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    // Tambahkan method spoofing
    formDataToSend.append("_method", "PUT");
    formDataToSend.append("category_name", formData.category_name);
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      // Gunakan method POST dengan _method spoofing
      const response = await authFetch(
        `http://127.0.0.1:8000/api/admin/category/${category.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formDataToSend,
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        if (result.message) {
          toast.error(result.message);
        }
        if (result.errors) {
          Object.values(result.errors).forEach((errArray) => {
            errArray.forEach((msg) => toast.error(msg));
          });
        }
        return;
      }

      toast.success(result.message);

      // Update state categories dengan data yang telah diperbarui
      setCategories((prevCategories) =>
        prevCategories.map((item) =>
          item.id === category.id ? result.category : item
        )
      );
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Terjadi kesalahan saat memperbarui kategori.");
    }
  };

  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Kategori">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Kategori
          </label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            placeholder="Misal: Jeans"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
          />
        </div>
        {/* Gambar Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar Kategori
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Pratinjau Gambar"
                className="w-20 h-20 object-cover rounded-md shadow-md"
              />
            )}
          </div>
        </div>
        {/* Tombol */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition duration-200"
          >
            Perbarui
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCategoryModal;
