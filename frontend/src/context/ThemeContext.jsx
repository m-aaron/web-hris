import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContextValue";

const THEME_STORAGE_KEY = "web-hris-theme";

const resolveInitialTheme = () => {
    if (typeof window === "undefined") return "light";

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(resolveInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === "dark";

        root.classList.toggle("theme-dark", isDark);
        root.setAttribute("data-theme", theme);

        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme: () => {
            setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
        },
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
