import PropTypes from "prop-types";
import Modal from "../Modal"; // Pastikan path benar

const ViewCategoryModal = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return "Tanggal tidak valid";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Kategori: ${category.category_name || ""}`}
    >
      <div className="space-y-4 text-sm sm:text-base">
        {/* ID */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            ID Kategori
          </p>
          <p className="text-gray-900">{category.id ?? "-"}</p>
        </div>
        {/* Nama Kategori */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Nama Kategori
          </p>
          <p className="text-gray-900">{category.category_name ?? "-"}</p>
        </div>

        {/* Gambar */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Gambar
          </p>
          {category.image_url ? (
            <img
              src={category.image_url} // Gunakan URL dari resource
              alt={category.category_name || "Gambar Kategori"}
              className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md border border-gray-200 shadow-sm"
              loading="lazy"
            />
          ) : (
            <p className="text-gray-500 italic">Tidak ada gambar</p>
          )}
        </div>
        {/* Tanggal Dibuat */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Tanggal Dibuat
          </p>
          <p className="text-gray-900">{formatDate(category.created_at)}</p>
        </div>
        {/* Tanggal Diperbarui */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Tanggal Diperbarui
          </p>
          <p className="text-gray-900">{formatDate(category.updated_at)}</p>
        </div>
      </div>
      {/* Tombol Tutup */}
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

ViewCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.number,
    category_name: PropTypes.string,
    image: PropTypes.string,
    image_url: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),
};

export default ViewCategoryModal;
