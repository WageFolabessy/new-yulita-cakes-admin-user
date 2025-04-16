import PropTypes from "prop-types";
import Modal from "../Modal";

const RatingStars = ({ rating, size = "text-lg" }) => {
  const totalStars = 5;
  const filledStars = Math.max(0, Math.min(totalStars, rating || 0));
  return (
    <div className={`flex items-center text-yellow-400 ${size}`}>
      {[...Array(filledStars)].map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {[...Array(totalStars - filledStars)].map((_, i) => (
        <span key={`e-${i}`} className="text-gray-300">
          ☆
        </span>
      ))}
      <span className="text-xs text-gray-600 ml-1.5">({rating || 0}/5)</span>
    </div>
  );
};
RatingStars.propTypes = { rating: PropTypes.number, size: PropTypes.string };

const ReviewDetailModal = ({ isOpen, onClose, review }) => {
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
    } catch {
      return "Invalid Date";
    }
  };

  if (!isOpen || !review) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Ulasan Produk">
      <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-2">
        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Informasi Ulasan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Pengguna
              </p>
              <p className="text-gray-900 font-medium">
                {review.user?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Produk
              </p>
              <p className="text-gray-900 font-medium">
                {review.product?.product_name || "N/A"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Rating
              </p>
              <RatingStars rating={review.rating} size="text-base" />{" "}
              {/* Ukuran disesuaikan */}
            </div>
            <div className="sm:col-span-2">
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Tanggal Ulasan
              </p>
              <p className="text-gray-900 font-medium">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2 border-b pb-1 text-pink-700">
            Isi Ulasan
          </h3>
          <div className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
            {" "}
            {review.review || (
              <span className="italic text-gray-500">
                Tidak ada ulasan teks.
              </span>
            )}
          </div>
        </section>
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

ReviewDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  review: PropTypes.shape({
    id: PropTypes.number,
    rating: PropTypes.number,
    review: PropTypes.string,
    created_at: PropTypes.string,
    user: PropTypes.shape({
      name: PropTypes.string,
    }),
    product: PropTypes.shape({
      product_name: PropTypes.string,
    }),
  }),
};

export default ReviewDetailModal;
