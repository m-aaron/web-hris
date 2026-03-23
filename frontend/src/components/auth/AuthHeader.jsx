import Logo from "../../assets/img/Logo.png";
import ThemeToggle from "../ThemeToggle";

const AuthHeader = () => {
    return (
        <>
            <header className="relative flex 
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
                <div className="absolute right-4">
                    <ThemeToggle />
                </div>
            </header>
        </>
    );
};

export default AuthHeader;
