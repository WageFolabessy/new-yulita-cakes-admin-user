import PropTypes from "prop-types";
import Modal from "../Modal"; // Pastikan path benar
import StatusBadge from "../Order/StatusBadge";

StatusBadge.propTypes = { status: PropTypes.string };

const PaymentDetailModal = ({ isOpen, onClose, payment }) => {
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
  const formatRupiah = (number) => {
    if (number === null || number === undefined || number === "") return "-";
    const num = Number(number);
    if (isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const renderMetadataValue = (value) => {
    if (typeof value === "object" && value !== null) {
      try {
        return (
          <pre className="mt-1 p-2 text-xs bg-white border border-gray-300 rounded overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      } catch (e) {
        return String(value);
      } // Fallback
    }
    return <span className="text-gray-800">{String(value)}</span>;
  };

  const renderMetadata = () => {
    const metadata = payment?.metadata;
    if (!metadata)
      return (
        <p className="text-gray-500 italic text-xs">
          Tidak ada metadata tambahan.
        </p>
      );

    let metadataObj = metadata;
    if (typeof metadataObj === "string") {
      try {
        metadataObj = JSON.parse(metadataObj);
      } catch (e) {
        /* Biarkan string */
      }
    }

    if (typeof metadataObj === "object" && metadataObj !== null) {
      const filteredMeta = Object.entries(metadataObj).filter(
        ([key]) =>
          !key.toLowerCase().includes("token") &&
          !key.toLowerCase().includes("password")
      );
      if (filteredMeta.length === 0) {
        return (
          <p className="text-gray-500 italic text-xs">
            Tidak ada metadata relevan.
          </p>
        );
      }

      return (
        <div className="text-xs bg-gray-50 p-3 border rounded-md space-y-2 max-h-60 overflow-y-auto">
          {filteredMeta.map(([key, value]) =>
            key === "va_numbers" && Array.isArray(value) ? (
              <div key={key}>
                <strong className="capitalize block mb-0.5 text-gray-700">
                  {key.replace(/_/g, " ")}:
                </strong>
                {value.map((va, index) => (
                  <div key={index} className="pl-2 text-gray-600">
                    <span>
                      Bank:{" "}
                      <strong className="font-medium text-gray-800">
                        {va.bank?.toUpperCase()}
                      </strong>
                      , VA:{" "}
                      <strong className="font-medium text-gray-800">
                        {va.va_number}
                      </strong>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div key={key}>
                <p className="break-words">
                  <strong className="capitalize font-medium text-gray-600">
                    {key.replace(/_/g, " ")}:
                  </strong>
                  {renderMetadataValue(value)}
                </p>
              </div>
            )
          )}
        </div>
      );
    }
    return (
      <p className="text-xs bg-gray-50 p-2 border rounded-md break-words">
        {String(metadataObj)}
      </p>
    );
  };

  if (!isOpen || !payment) {
    return null;
  }

  const DetailItem = ({
    label,
    value,
    isBadge = false,
    badgeStatus = "",
    colSpan = "sm:col-span-1",
  }) => (
    <div className={`col-span-1 ${colSpan}`}>
      <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {isBadge ? (
        <StatusBadge status={badgeStatus} />
      ) : (
        <p className="text-gray-900 font-medium break-words">{value || "-"}</p>
      )}
    </div>
  );
  DetailItem.propTypes = {
    label: PropTypes.string,
    value: PropTypes.any,
    isBadge: PropTypes.bool,
    badgeStatus: PropTypes.string,
    colSpan: PropTypes.string,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pembayaran #${payment.id || "N/A"}`}
    >
      <div className="space-y-5 text-sm">
        <section>
          <h3 className="text-base font-semibold mb-3 border-b pb-1.5 text-pink-700">
            Informasi Pembayaran
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            <DetailItem label="ID Pembayaran" value={payment.id} />
            <DetailItem
              label="No. Pesanan"
              value={payment.order?.order_number}
            />
            <DetailItem
              label="Tanggal"
              value={formatDate(payment.created_at)}
            />
            <DetailItem label="Jumlah" value={formatRupiah(payment.amount)} />
            <DetailItem
              label="Tipe Pembayaran"
              value={
                payment.payment_type ? payment.payment_type.toUpperCase() : "-"
              }
            />
            <DetailItem
              label="Status"
              isBadge={true}
              badgeStatus={payment.status_label || payment.status}
            />
            <DetailItem
              label="ID Transaksi"
              value={payment.transaction_id}
              colSpan="sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-3 border-b pb-1.5 text-pink-700">
            Detail Transaksi (Metadata)
          </h3>
          {renderMetadata()}
        </section>

        <section>
          <h3 className="text-base font-semibold mb-3 border-b pb-1.5 text-pink-700">
            Pelanggan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Nama
              </p>
              <p className="text-gray-900 font-medium">
                {payment.order?.user?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                Email
              </p>
              <p className="text-gray-600">
                {payment.order?.user?.email || "-"}
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* Tombol Tutup */}
      <div className="flex justify-end pt-4 mt-5 border-t border-gray-200">
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

PaymentDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  payment: PropTypes.shape({
    id: PropTypes.number,
    order_id: PropTypes.number,
    payment_type: PropTypes.string,
    transaction_id: PropTypes.string,
    status: PropTypes.string,
    status_label: PropTypes.string,
    amount: PropTypes.number,
    metadata: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    created_at: PropTypes.string,
    order: PropTypes.shape({
      order_number: PropTypes.string,
      total_amount: PropTypes.number,
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    }),
  }),
};

export default PaymentDetailModal;
