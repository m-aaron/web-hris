const Input = ({ ...props }) => {
    return (
        <input 
            { ...props }
            className="w-full 
            py-3 px-3 
            text-lg text-heading
            border border-border
            rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            transition duration-200"
        />
    )
}

export default Input