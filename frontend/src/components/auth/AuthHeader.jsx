import Logo from "../../assets/img/Logo.png";

const AuthHeader = () => {
    return (
        <>
            <header className="flex 
                items-center justify-center 
                gap-3 px-4 py-3
                bg-background
                shadow-md">
                <img 
                    src={ Logo }
                    alt="MC"
                    className="h-10 w-10"
                />
                <span className=" text-primary
                text-2xl font-bold 
                text-text-primary-light
                leading-none">
                    MC HRIS
                </span>
            </header>
        </>
    );
};

export default AuthHeader;
