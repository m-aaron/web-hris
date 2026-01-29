const Spinner = ({ size = 40 }) => {
    return (
        <div 
            className="spinner" 
            style={{ width: `${size}px`, height: `${size}px` }}
        ></div>
    )
}

export default Spinner