import Button from "../../Button";

const PaginationFooter = ({ total = 0, page = 1, totalPages = 1, setQuery }) => {

  const changePage = (newPage) => {
    setQuery(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (

    <div className="
      flex flex-col gap-4
      md:flex-row md:items-center md:justify-between
      py-4
      border-t border-border
      bg-card
    ">

      {/* Page Info */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted">

        <span>
          Page <span className="font-semibold text-heading">{page}</span> of{" "}
          <span className="font-semibold text-heading">{totalPages}</span>
        </span>

        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-card">
          {total} total
        </span>
        
      </div>

      {/* Buttons */}
      <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3">

        <Button
          size="small"
          variant="secondary"
          disabled={page === 1}
          onClick={() => changePage(page - 1)}
          className="flex-1 md:flex-none px-4"
        >
          Prev
        </Button>

        <Button
          size="small"
          variant="primary"
          disabled={page === totalPages}
          onClick={() => changePage(page + 1)}
          className="flex-1 md:flex-none px-4"
        >
          Next
        </Button>

      </div>

    </div>
    
  );
};

export default PaginationFooter;
