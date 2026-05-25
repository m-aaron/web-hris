import { Trash2, Edit } from "lucide-react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../ui/Table";
import { useState } from "react";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../../Skeleton";

const FacultyTable = ({ faculties = [], loading = false, onEdit, onDelete, query, setQuery }) => {
  const [hoveredRowId, setHoveredRowId] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto max-h-[600px]">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[1%]">No.</TableHeaderCell>
            <TableHeaderCell className="w-[15%]">Name</TableHeaderCell>
            <TableHeaderCell className="w-[15%]">Date of Employment</TableHeaderCell>
            <TableHeaderCell className="w-[10%]">Years in Service</TableHeaderCell>
            <TableHeaderCell className="w-[29%]">Academic Qualifications</TableHeaderCell>
            <TableHeaderCell className="w-[15%]">Academic Rank</TableHeaderCell>
            <TableHeaderCell className="w-[10%]">Employment Status</TableHeaderCell>
            <TableHeaderCell className="w-[5%]">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody className="divide-y">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={`s-${i}`}>
              <TableCell><Skeleton className="h-4 w-6" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-64" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 rounded-xl" /></TableCell>
            </TableRow>
          ))}

          {!loading && faculties.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-8">
                <EmptyState title="No faculty found" description="Add a faculty record or adjust filters." className="max-w-none" />
              </TableCell>
            </TableRow>
          )}

          {!loading && faculties.map((f, idx) => (
            <TableRow key={f.id} className="text-muted hover:bg-soft-surface/80 transition" onMouseEnter={() => setHoveredRowId(f.id)} onMouseLeave={() => setHoveredRowId(null)}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-heading">{formatEmployeeDisplayName({ last_name: f.last_name, first_name: f.first_name, middle_name: f.middle_name, name_extension: f.name_extension }, "N/A")}</span>
                  <span className="text-xs text-muted">{f.employee_no || "-"}</span>
                </div>
              </TableCell>
              <TableCell>{f.date_hired || "N/A"}</TableCell>
              <TableCell>{f.years_in_service || "N/A"}</TableCell>
              <TableCell className="text-xs">
                {f.academic_qualifications ? (
                  <ul className="list-disc list-inside">
                    {f.academic_qualifications.split(';').map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-muted inline-block" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <p className="font-semibold">{f.position_name || "-"}</p>
                <div className="text-xs text-muted">
                  {f.teaching_load ? (
                    <ul className="list-disc list-inside">
                      {f.teaching_load.split(',').map((q, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-muted inline-block" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{f.employment_status || "N/A"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue cursor-pointer" onClick={() => onEdit(f)} />
                  <Trash2 className="w-5 h-5 text-red cursor-pointer" onClick={() => onDelete(f)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacultyTable;
