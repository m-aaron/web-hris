const Button = ({ children, variant = "primary", ...props }) => {

    const styles = {
        primary: "bg-primary text-card hover:opacity-90",
    };

    return (
        <button
            { ...props }
            className={`w-full py-3 px-3 text-lg font-semibold rounded-xl cursor-pointer
                ${styles[variant]} transition duration-200`}
        >
            { children }
        </button>
    )
}

export default Button