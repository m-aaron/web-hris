const Spinner = ({ size = 40, className = "", label = "Loading" }) => {
    return (
        <div 
            className={`spinner ${className}`} 
            style={{ width: `${size}px`, height: `${size}px` }}
            role="status"
            aria-label={label}
        ></div>
    )
}

export default Spinner