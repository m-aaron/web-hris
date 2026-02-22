import { motion, AnimatePresence } from "framer-motion";
import Button from "../../Button";
import { Loader2 } from "lucide-react";

const BulkActionBar = ({
  selectedIds = [],
  onArchive,
  onExport,
  clearSelection,
  loading = false
}) => {
  
  const selectedCount = selectedIds.length;

  if (!selectedCount) return null;

  return (
    <AnimatePresence>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 
        bg-card shadow-2xl 
        rounded-2xl px-6 py-3 flex items-center gap-4 text-sm z-50"
      >
        <span className="font-medium text-heading">
          {selectedCount} selected
        </span>

        <Button
          size="small"
          variant="danger"
          disabled={loading}
          onClick={onArchive}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Archive"
          )}
        </Button>

        <Button
          size="small"
          variant="secondary"
          disabled={loading}
          onClick={onExport}
        >
          Export
        </Button>

        <Button
          size="small"
          variant="outline"
          disabled={loading}
          onClick={clearSelection}
        >
          Clear
        </Button>
        
      </motion.div>

    </AnimatePresence>
  );
};

export default BulkActionBar;