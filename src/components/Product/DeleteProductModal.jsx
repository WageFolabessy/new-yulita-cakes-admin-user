import Modal from "../Modal";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const DeleteProductModal = ({ isOpen, onClose, product, setProducts }) => {
  const { authFetch } = useContext(AppContext);

  if (!product) return null;

  // Handler untuk menghapus produk via endpoint DELETE
  const handleDelete = async () => {
    try {
      const response = await authFetch(`/api/admin/product/${product.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Hapus produk dari state products
        setProducts((prevProducts) =>
          prevProducts.filter((item) => item.id !== product.id)
        );
        toast.success(result.message || "Produk berhasil dihapus.");
        onClose();
      } else {
        toast.error(result.message || "Gagal menghapus produk.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menghapus produk.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Produk">
      <p className="mb-4">
        Apakah Anda yakin ingin menghapus produk{" "}
        <strong>{product.product_name}</strong>?
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

export default DeleteProductModal;
