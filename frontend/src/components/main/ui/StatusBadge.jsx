import { formatEnum } from "../../../helpers/employeeHelper"

const statusColors = {
    REGULAR: "bg-light-green text-green border border-green",
    PROBATIONARY: "bg-light-yellow text-yellow border border-yellow",
    CONTRACTUAL: "bg-grey text-muted border border-muted",
    ARCHIVED: "bg-light-red text-red border border-red",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
        statusColors[status] ||
        "bg-grey text-muted border border-muted"
      }`}
    >
      {formatEnum(status)}
    </span>
  )
}