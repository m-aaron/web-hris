import { useState } from "react";
import { useEmployeesQuery } from "../../hooks/useEmployeesQuery";
import { bulkArchiveEmployees, exportEmployeesExcel, exportSelectedEmployeesExcel } from "../../services/employeeService";
import { downloadFile } from "../../utils/downloadFile";
import { toast } from "sonner";

import EmployeesHeader from "../../components/main/employee/EmployeesHeader";
import SearchAndFilters from "../../components/main/employee/SearchAndFilters";
import EmployeesTable from "../../components/main/employee/EmployeesTable";
import PaginationFooter from "../../components/main/employee/PaginationFooter";
import BulkActionBar from "../../components/main/employee/BulkActionBar";
import ViewEmployeeDrawer from "../../components/main/employee/ViewEmployeeDrawer";
import ConfirmModal from "../../components/main/ui/ConfirmModal";
import { Card } from "../../components/main/ui/Card";

export default function EmployeesPage() {

  const [query, setQuery] = useState({
    search: "",
    page: 1,
    limit: 10,
    type: "",
    status: "",
    basis: "",
    sex: "",
    regularization_filter: "",
    sort: "date_hired_desc"
  });

  const [drawerEmployee, setDrawerEmployee] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const { 
    data, 
    pagination, 
    loading: queryLoading,
    refetch,
    removeFromList
  } = useEmployeesQuery(query);


  const handleBulkArchive = async () => {
    try {
      setActionLoading(true);

      const res = await bulkArchiveEmployees(selectedIds);

      // Optimistically remove archived employees from the list
      removeFromList(selectedIds);

      setSelectedIds([]);
      setShowArchiveModal(false);

      // Refetch to get updated pagination and any other changes
      refetch();

      toast.success(res.message || "Employees archived successfully");
    } catch (err) {
      console.error(err);
      refetch(); // Restore list in case of error
      toast.error("Failed to archive employees. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const response = await exportEmployeesExcel(query);
      downloadFile(response, "employees.xlsx");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export employees. Please try again.");
    }
  };

  const handleExportSelected = async () => {
    try {
      const response = await exportSelectedEmployeesExcel(selectedIds);
      downloadFile(response, "employees-selected-report.xlsx");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export selected employees. Please try again.");
    }
  };

  const handleArchiveUpdated = (archivedEmployeeId) => {
    removeFromList([archivedEmployeeId]); // remove archived employee from list
    setDrawerEmployee(null); // close drawer
    refetch(); // fetch updated list from backend
  };

  const handleStatusUpdated = (updatedEmployee) => {
    removeFromList([updatedEmployee.id]); // remove old row
    refetch(); // fetch updated list from backend
  };

  return (
    <>

      <EmployeesHeader
        showReset={true}
        onCreate={() => navigate("/employees/create")}
        onExport={handleExportAll}
        onResetFilters={() =>
          setQuery({
            search: "",
            page: 1,
            limit: 10,
            type: "",
            status: "",
            basis: "",
            sex: "",
            regularization_filter: "",
            sort: "date_hired_desc"
          })
        }
      />

      <SearchAndFilters
        query={query}
        setQuery={setQuery}
      />

      <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="p-4 flex-1 flex flex-col bg-card rounded-2xl overflow-hidden">

          <EmployeesTable
            employees={data || []}
            loading={queryLoading}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            setDrawerEmployee={setDrawerEmployee}
            query={query}
            setQuery={setQuery}
            disableSelection={actionLoading}
          />

          <PaginationFooter
            total={pagination.total || 0}
            page={pagination.page || 1}
            totalPages={pagination.total_pages || 1}
            setQuery={setQuery}
          />

        </div>
      </Card>

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          loading={actionLoading}
          onArchive={() => setShowArchiveModal(true)}
          onExport={handleExportSelected}
          clearSelection={() => setSelectedIds([])}
        />
      )}

      <ViewEmployeeDrawer
        employee={drawerEmployee}
        onClose={() => setDrawerEmployee(null)}
        onEmployeeArchived={handleArchiveUpdated}
        onStatusUpdated={handleStatusUpdated}
      />

      {showArchiveModal && (
        <ConfirmModal
          title="Archive Selected Employees?"
          description={`You are about to archive ${selectedIds.length} employees. This action cannot be undone.`}
          action="Archive"
          primaryButtonVariant="solidDanger"
          onCancel={() => setShowArchiveModal(false)}
          onConfirm={handleBulkArchive}
        />
      )}

    </>
  );
}