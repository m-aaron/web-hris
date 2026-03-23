import Button from "../../Button";

const EmployeesHeader = ({
  onCreate,
  onExport,
  onResetFilters,
  showReset = false
}) => {

  return (
    <section className="pb-6 pt-2">

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-start">

        {/* LEFT SIDE */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Employees
            </h1>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-muted">
            Manage employee records, updates, and status visibility across the organization.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:self-start">

          {showReset && (
            <Button
              variant="secondary"
              size="small"
              className="w-full"
              onClick={onResetFilters}
            >
              Reset Filters
            </Button>
          )}

          <Button
            variant="secondary"
            size="small"
            className="w-full"
            onClick={onExport}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="small"
            className="w-full"
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
