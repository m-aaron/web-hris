import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from "../ui/Table";
import { Clock, AlertTriangle, Cake, Mars, Venus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { formatPHDate } from "../../../helpers/dateHelper";
import Badge from "../ui/Badge";


  const EmployeesTable = ({
    employees,
    selectedIds,
    setSelectedIds,
    setDrawerEmployee,
    query,
    setQuery,
    disableSelection = false
  }) => {


  const toggleSort = (field) => {
    setQuery(prev => {
      const isAsc = prev.sort === `${field}_asc`;

      const newSort = `${field}_${isAsc ? "desc" : "asc"}`;

      return {
        ...prev,
        page: 1,
        sort: newSort
      };
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const getSortIcon = (field) => {
    if (!query.sort.startsWith(field)) return <ArrowUpDown size={14} className="inline ml-1 opacity-60" />;

    return query.sort.endsWith("asc")
      ? <ArrowUp size={14} className="inline ml-1" />
      : <ArrowDown size={14} className="inline ml-1" />;
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
              className="w-[20%] cursor-pointer"
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

            <TableHeaderCell className="w-[9%]" >Basis</TableHeaderCell>

            <TableHeaderCell className="w-[10%]">Birth Date</TableHeaderCell>

            <TableHeaderCell className="w-[3%]">Gender</TableHeaderCell>

            <TableHeaderCell 
              onClick={() => toggleSort("date_hired")}
              className="w-[10%] cursor-pointer"
            >
              Date Hired
              {getSortIcon("date_hired")}
            </TableHeaderCell>

            <TableHeaderCell className="w-[15%]">Regularization</TableHeaderCell>

          </TableRow>
        </TableHead>

        {/* TABLE BODY */}
        <TableBody className="divide-y">
          {employees.map((row, index) => (
            <TableRow
              key={row.id}
              className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition group"
            >
              <TableCell>
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
              >{row.employee_no}</TableCell>

              <TableCell
                className="cursor-pointer"
                onClick={() => setDrawerEmployee(row)}
              >
                {row.last_name}, {row.first_name}
                {row.birthday_flag === "birthday_today" && (
                  <Badge
                    variant="success"
                    icon={Cake}
                  >
                    Birthday Today
                  </Badge>
                )}
              </TableCell>

              <TableCell
                className="cursor-pointer"
                onClick={() => setDrawerEmployee(row)}
              >
                {row.employment_type.replace("_", "-")}
              </TableCell>

              <TableCell
                className="cursor-pointer"
                onClick={() => setDrawerEmployee(row)}
              >
                {row.employment_status}
              </TableCell>

              <TableCell
                className="cursor-pointer"
                onClick={() => setDrawerEmployee(row)}
              >
                {row.employment_basis.replace("_", "-")}
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
                {row.date_hired ? formatPHDate(row.date_hired) : "N/A"}
              </TableCell>

              <TableCell
                className="cursor-pointer"
                onClick={() => setDrawerEmployee(row)}
              >
                {row.regularization_date ? (
                  <div className="flex flex-col items-start gap-1">

                    <span>
                      {formatPHDate(row.regularization_date)}
                    </span>

                    {row.regularization_flag === "near_30_days" && (
                      <Badge
                        variant="warning"
                        icon={Clock}
                      >
                        Regularizing Soon
                      </Badge>
                    )}

                    {row.regularization_flag === "overdue" && (
                      <Badge
                        variant="danger"
                        icon={AlertTriangle}
                      >
                        Overdue
                      </Badge>
                    )}

                  </div>
                ) : (
                  <span>N/A</span>
                )}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>

  );
};

export default EmployeesTable;
