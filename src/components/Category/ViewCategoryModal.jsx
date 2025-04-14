import { useState, useEffect, useContext } from "react";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";


const ViewCategoryModal = ({ isOpen, onClose, category }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState(null);

  const { authFetch } = useContext(AppContext);

  useEffect(() => {
    if (isOpen && category) {
      fetchCategoryDetails();
    }
  }, [isOpen, category]);

  const fetchCategoryDetails = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/api/admin/category/${category.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setCategoryDetails(result);
      } else {
        toast.error(result.message || "Gagal mengambil data kategori.");
        onClose();
      }
    } catch (error) {
      toast.error("Gagal menghubungi server.");
      console.error("Error:", error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Jika belum ada data detail, jangan render konten
  if (!categoryDetails) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Kategori">
      <div className="space-y-6">
        {/* Nama Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Kategori:
          </label>
          <p className="text-lg text-gray-900">
            {categoryDetails.category_name}
          </p>
        </div>
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug:
          </label>
          <p className="text-lg text-gray-900">{categoryDetails.slug}</p>
        </div>
        {/* Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar:
          </label>
          <img
            src={`/storage/${categoryDetails.image}`}
            alt={categoryDetails.category_name}
            className="w-48 h-48 object-cover rounded-md shadow-md"
          />
        </div>
      </div>
      {/* Tombol Tutup */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

export default ViewCategoryModal;
