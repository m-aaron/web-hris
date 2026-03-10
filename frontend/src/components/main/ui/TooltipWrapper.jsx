const TooltipWrapper = ({
  show,
  message,
  children
}) => {
  return (
    <div className="relative group inline-block">
      {children}

      {show && (
        <div className="
          absolute right-0 mt-2 w-64
          bg-card border border-border
          text-xs text-muted
          rounded-xl p-3
          shadow-lg
          opacity-0 group-hover:opacity-100
          transition pointer-events-none
          z-50
        ">
          {message}
        </div>
      )}
    </div>
  );
};

export default TooltipWrapper;