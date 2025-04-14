import Modal from "../Modal";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";


const DeleteCategoryModal = ({ isOpen, onClose, category, setCategories }) => {

  const { authFetch } = useContext(AppContext);

  if (!category) return null;

  const handleDelete = async () => {
    try {
      const response = await authFetch(`http://localhost:8000/api/admin/category/${category.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Gagal menghapus kategori.");
      } else {
        toast.success(result.message);
        // Hapus kategori dari state
        setCategories((prevCategories) =>
          prevCategories.filter((item) => item.id !== category.id)
        );
        onClose();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Terjadi kesalahan saat menghapus kategori.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kategori">
      <p className="mb-4">
        Apakah Anda yakin ingin menghapus kategori{" "}
        <strong>{category.category_name}</strong>?
      </p>
      <div className="text-right">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 mr-2 rounded hover:bg-gray-600 transition duration-200"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          Hapus
        </button>
      </div>
    </Modal>
  );
};

export default DeleteCategoryModal;
