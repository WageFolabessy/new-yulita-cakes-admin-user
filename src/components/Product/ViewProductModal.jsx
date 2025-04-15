import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import "react-quill/dist/quill.snow.css"; // Tetap impor jika Quill digunakan untuk format deskripsi

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) {
    return null;
  }

  // Helper functions (bisa diletakkan di luar komponen atau di file terpisah)
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
      return "Tanggal tidak valid";
    }
  };

  const formatRupiah = (number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Produk: ${product.product_name || ""}`}
    >
      <div className="space-y-4 text-sm sm:text-base max-h-[70vh] overflow-y-auto pr-2">
        {" "}
        {/* Tambah max-h & scroll */}
        {/* ID & Label */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              ID Produk
            </p>
            <p className="text-gray-900 font-medium">{product.id ?? "-"}</p>
          </div>
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Label
            </p>
            <p className="text-gray-900 font-medium">{product.label || "-"}</p>
          </div>
        </div>
        {/* Nama & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Nama Produk
            </p>
            <p className="text-gray-900 font-medium">
              {product.product_name ?? "-"}
            </p>
          </div>
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Kategori
            </p>
            <p className="text-gray-900 font-medium">
              {product.category?.category_name || "-"}
            </p>
          </div>
        </div>
        {/* Harga */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Harga Asli
            </p>
            <p className="text-gray-900 font-medium">
              {formatRupiah(product.original_price)}
            </p>
          </div>
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Harga Diskon
            </p>
            <p className="text-gray-900 font-medium">
              {formatRupiah(product.sale_price)}
            </p>
          </div>
        </div>
        {/* Stok & Berat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Stok
            </p>
            <p className="text-gray-900 font-medium">{product.stock ?? "-"}</p>
          </div>
          <div>
            <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Berat (gram)
            </p>
            <p className="text-gray-900 font-medium">{product.weight ?? "-"}</p>
          </div>
        </div>
        {/* Deskripsi */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
            Deskripsi
          </p>
          {product.description ? (
            // Menggunakan div biasa untuk menampilkan HTML, styling via @tailwindcss/typography jika di-setup
            <div
              className="prose prose-sm max-w-none text-gray-800 mt-1"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            // Alternatif jika tidak pakai plugin prose:
            // <div className="text-gray-800 mt-1" dangerouslySetInnerHTML={{ __html: product.description }}/>
            <p className="text-gray-500 italic mt-1">Tidak ada deskripsi.</p>
          )}
        </div>
        {/* Gambar */}
        <div>
          <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Gambar
          </p>
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-wrap gap-3 mt-1">
              {product.images.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.image_url}
                    alt={`Gambar ${img.id}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border border-gray-200 shadow-sm"
                    loading="lazy"
                  />
                  {!!img.is_primary && ( // Konversi ke boolean eksplisit
                    <span className="absolute bottom-1 right-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow">
                      Utama
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-1">Tidak ada gambar.</p>
          )}
        </div>
        {/* Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 pt-2">
          <p>Dibuat: {formatDate(product.created_at)}</p>
          <p>Diperbarui: {formatDate(product.updated_at)}</p>
        </div>
      </div>
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

ViewProductModal.propTypes = {
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
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    category: PropTypes.shape({
      category_name: PropTypes.string,
    }),
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        image_url: PropTypes.string,
        is_primary: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      })
    ),
  }),
};

export default ViewProductModal;
