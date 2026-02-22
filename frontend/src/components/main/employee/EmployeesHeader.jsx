import Button from "../../Button";

const EmployeesHeader = ({
  onCreate,
  onExport,
  onResetFilters,
  showReset = false
}) => {

  return (
    <section className="py-5">

      <div className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-heading tracking-tight">
              Employees
            </h1>
          </div>

          <p className="text-sm text-muted max-w-md">
            Manage and monitor all employee records
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

          {showReset && (
            <Button
              variant="secondary"
              size="small"
              onClick={onResetFilters}
            >
              Reset Filters
            </Button>
          )}

          <Button
            variant="secondary"
            size="small"
            onClick={onExport}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="small"
            onClick={onCreate}
          >
            + Create Employee
          </Button>

        </div>
        
      </div>

    </section>
  );

};

export default EmployeesHeader;
