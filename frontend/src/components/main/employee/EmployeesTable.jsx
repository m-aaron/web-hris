import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../ui/Table";
import {
  Clock,
  AlertTriangle,
  Cake,
  Mars,
  Venus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";

import { formatPHDate } from "../../../helpers/dateHelper";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";
import { RECORD_STATUSES } from "../../../constants/employeeConstant";
import Badge from "../ui/Badge";
import Tooltip from "../ui/Tooltip";
import Skeleton from "../../Skeleton";
import EmptyState from "../ui/EmptyState";

const EmployeesTable = ({
  employees,
  selectedIds,
  setSelectedIds,
  setDrawerEmployee,
  query,
  setQuery,
  loading = false,
  disableSelection = false,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const toggleSort = (field) => {
    setQuery((prev) => {
      const isAsc = prev.sort === `${field}_asc`;

      const newSort = `${field}_${isAsc ? "desc" : "asc"}`;

      return {
        ...prev,
        page: 1,
        sort: newSort,
      };
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getSortIcon = (field) => {
    if (!query.sort?.startsWith(field))
      return <ArrowUpDown size={14} className="inline ml-1 opacity-60" />;

    return query.sort.endsWith("asc") ? (
      <ArrowUp size={14} className="inline ml-1" />
    ) : (
      <ArrowDown size={14} className="inline ml-1" />
    );
  };

  const formatEnumCell = (value) => {
    if (!value) return "N/A";
    return String(value).replaceAll("_", "-");
  };

  const formatName = (row) => {
    return formatEmployeeDisplayName(row, "N/A");
  };

  const getRecordStatusTooltip = (recordStatus) => {
    if (recordStatus === RECORD_STATUSES.DRAFT) return "Draft employee";
    if (recordStatus === RECORD_STATUSES.ARCHIVED) return "Archived employee";
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Table>
        {/* TABLE HEADER */}
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[1%]"></TableHeaderCell>

            <TableHeaderCell className="w-[1%]">No.</TableHeaderCell>

            <TableHeaderCell
              onClick={() => toggleSort("employee_no")}
              className="w-[10%] cursor-pointer"
            >
              Employee ID
              {getSortIcon("employee_no")}
            </TableHeaderCell>

            <TableHeaderCell
              onClick={() => toggleSort("name")}
              className="w-[15%] cursor-pointer"
            >
              Full Name
              {getSortIcon("name")}
            </TableHeaderCell>

            <TableHeaderCell
              onClick={() => toggleSort("type")}
              className="w-[11%] cursor-pointer"
            >
              Type
              {getSortIcon("type")}
            </TableHeaderCell>

            <TableHeaderCell
              onClick={() => toggleSort("status")}
              className="w-[10%] cursor-pointer"
            >
              Status
              {getSortIcon("status")}
            </TableHeaderCell>

            <TableHeaderCell className="w-[9%]">Basis</TableHeaderCell>

            <TableHeaderCell className="w-[10%]">Birth Date</TableHeaderCell>

            <TableHeaderCell className="w-[3%]">Gender</TableHeaderCell>

            <TableHeaderCell
              onClick={() => toggleSort("date_hired")}
              className="w-[15%] cursor-pointer"
            >
              Date Hired
              {getSortIcon("date_hired")}
            </TableHeaderCell>

            <TableHeaderCell className="w-[15%]">
              Regularization
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        {/* TABLE BODY */}
        <TableBody className="divide-y">
          {loading &&
            Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`} className="text-muted">
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
              </TableRow>
            ))}

          {!loading && employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="py-8">
                <EmptyState
                  title="No employees found"
                  description="Try adjusting your filters, status, or search keyword."
                  className="max-w-none"
                />
              </TableCell>
            </TableRow>
          )}

          {!loading && employees.map((row, index) => {
            const rowTooltip = getRecordStatusTooltip(row.record_status);

            return (
              <TableRow
                key={row.id}
                onMouseEnter={() => setHoveredRowId(row.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                className={`text-muted hover:bg-soft-surface/80 transition group
                  ${row.record_status === RECORD_STATUSES.DRAFT ? "border-l-4 border-yellow bg-yellow/10 hover:bg-yellow/20" : ""}
                  ${row.record_status === RECORD_STATUSES.ARCHIVED ? "border-l-4 border-red bg-red/10 hover:bg-red/20" : ""}
                `}
              >
                <TableCell>
                  {rowTooltip && (
                    <Tooltip
                      text={rowTooltip}
                      open={hoveredRowId === row.id}
                      align="start"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-0 w-0"
                      />
                    </Tooltip>
                  )}

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    disabled={disableSelection}
                  />
                </TableCell>

                <TableCell>{index + 1}</TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.employee_no}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {formatName(row)}
                  {row.birthday_flag === "birthday_today" && (
                    <Badge variant="success" icon={Cake}>
                      Birthday Today
                    </Badge>
                  )}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {formatEnumCell(row.employment_type)}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.employment_status || "N/A"}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {formatEnumCell(row.employment_basis)}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.birth_date ? formatPHDate(row.birth_date) : "N/A"}
                </TableCell>

                <TableCell
                  className="cursor-pointer text-center"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.sex === "MALE" && (
                    <Mars size={18} className="mx-auto text-male" />
                  )}
                  {row.sex === "FEMALE" && (
                    <Venus size={18} className="mx-auto text-female" />
                  )}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.date_hired ? (
                    row.years_in_service ? (
                      `${formatPHDate(row.date_hired)} (${row.years_in_service.replace("year", "Year").replace("years", "Years")})`
                    ) : (
                      formatPHDate(row.date_hired)
                    )
                  ) : "N/A"}
                </TableCell>

                <TableCell
                  className="cursor-pointer"
                  onClick={() => setDrawerEmployee(row)}
                >
                  {row.regularization_date ? (
                    <div className="flex flex-col items-start gap-1">
                      <span>{formatPHDate(row.regularization_date)}</span>

                      {row.regularization_flag === "near_30_days" && (
                        <Badge variant="warning" icon={Clock}>
                          Regularizing Soon
                        </Badge>
                      )}

                      {row.regularization_flag === "overdue" && (
                        <Badge variant="danger" icon={AlertTriangle}>
                          Overdue
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span>N/A</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesTable;
