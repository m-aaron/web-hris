import { useMemo, useState } from "react";
import { Card } from "../ui/Card";
import SelectField from "../ui/SelectField";

const SearchAndFilters = ({ query, setQuery }) => {

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    const filterValues = [
      query.type,
      query.status,
      query.basis,
      query.sex,
      query.regularization_filter,
    ];

    return filterValues.filter(Boolean).length;
  }, [
    query.type,
    query.status,
    query.basis,
    query.sex,
    query.regularization_filter,
  ]);

  const handleChange = (field, value) => {
    setQuery(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  return (

    <section className="pb-5">

      <Card className="p-4 space-y-4 pb-5">
        
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">

          <input
            type="text"
            placeholder="Search employees..."
            value={query.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="
              col-span-10 md:col-span-3 
              w-full px-4 py-2 
              text-heading 
              border border-border
              rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-primary
              focus:border-primary
              transition duration-200"
          />

          <div className="col-span-10 md:hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              aria-expanded={showMobileFilters}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-muted/20 transition"
            >
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>

          <div
            className={`col-span-10 md:col-span-7 ${showMobileFilters ? "grid" : "hidden"} md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3`}
          >
            <SelectField
              label="Employee Type"
              value={query.type}
              onChange={(value) => handleChange("type", value)}
              options={[
                { value: "", label: "All" },
                { value: "TEACHING", label: "Teaching" },
                { value: "NON_TEACHING", label: "Non-Teaching" }
              ]}
              className="px-3 py-2 text-sm"
            />

            <SelectField
              label="Employee Status"
              value={query.status}
              onChange={(value) => handleChange("status", value)}
              options={[
                { value: "", label: "All" },
                { value: "REGULAR", label: "Regular" },
                { value: "PROBATIONARY", label: "Probationary" },
                { value: "CONTRACTUAL", label: "Contractual" }
              ]}
              className="px-3 py-2 text-sm"
            />

            <SelectField
              label="Employee Basis"
              value={query.basis}
              onChange={(value) => handleChange("basis", value)}
              options={[
                { value: "", label: "All" },
                { value: "FULL_TIME", label: "Full Time" },
                { value: "PART_TIME", label: "Part Time" }
              ]}
              className="px-3 py-2 text-sm"
            />

            <SelectField
              label="Gender"
              value={query.sex}
              onChange={(value) => handleChange("sex", value)}
              options={[
                { value: "", label: "All" },
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" }
              ]}
              className="px-3 py-2 text-sm"
            />

            <SelectField
              label="Regularization Status "
              value={query.regularization_filter}
              onChange={(value) => handleChange("regularization_filter", value)}
              options={[
                { value: "", label: "All" },
                { value: "near_30_days", label: "Near 30 Days" },
                { value: "overdue", label: "Overdue" }
              ]}
              className="px-3 py-2 text-sm"
            />

          </div>

        </div>

      </Card>

    </section>
    
  );
};

export default SearchAndFilters;