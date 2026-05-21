import Button from "../../Button";
import { getSchoolYear } from "../../../helpers/schoolYearHelper";

const FacultyHeader = ({ onCreate, onResetFilters, showReset = false }) => {
  const schoolYear = getSchoolYear();

  return (
    <section className="pb-6 pt-2">

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-start">

        {/* LEFT SIDE */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Faculty List
            </h1>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-muted">
            LIST OF FACULTY — SY {schoolYear}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:self-start">

          <div />

          <Button
            variant="primary"
            size="small"
            className="w-full"
            onClick={onCreate}
          >
            + Add Faculty
          </Button>

        </div>
      </div>

    </section>
  );
};

export default FacultyHeader;
