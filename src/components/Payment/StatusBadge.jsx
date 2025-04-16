import PropTypes from "prop-types";

const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let text = status || "N/A";
  const lowerStatus = String(text).toLowerCase();
  switch (lowerStatus) {
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "paid":
    case "settlement":
    case "delivered":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "processing":
    case "shipped":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "cancelled":
    case "deny":
    case "expired":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    default:
      text = String(status).replace(/_/g, " ");
      break;
  }
  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor} capitalize whitespace-nowrap`}
    >
      {text}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string };

export default StatusBadge;
