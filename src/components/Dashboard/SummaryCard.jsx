import PropTypes from "prop-types";

const SummaryCard = ({ title, value, icon, className }) => {
  return (
    <div className={`p-5 rounded-xl flex items-center gap-4 ${className}`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="text-sm sm:text-base font-medium text-gray-600">
          {title}
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  className: PropTypes.string,
};

SummaryCard.defaultProps = {
  className: "bg-gray-100 border border-gray-200",
};

export default SummaryCard;
