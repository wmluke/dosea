import { useFetcher } from "@remix-run/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

export const DARK_THEME = "night";
export const LIGHT_THEME = "light";

export type ThemeMode = "light" | "dark" | "system";


export type ThemeContextType = {
    isDarkMode: boolean;
    themeMode: ThemeMode;
}

export function getTheme(isDarkMode: boolean): string {
    return isDarkMode ? DARK_THEME : LIGHT_THEME;
}

export const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    themeMode: "system"
});

export function useThemeContext() {
    return useContext(ThemeContext);
}

export function useTheme() {
    const fetcher = useFetcher();
    const isDarkOS = useMediaQuery("(prefers-color-scheme: dark)");

    const [themeContext, setThemeContext] = useState(useThemeContext());
    const { isDarkMode, themeMode } = themeContext;

    function setThemeMode(themeMode: ThemeMode) {
        const isDarkMode = (themeMode !== "system" ? themeMode === "dark" : isDarkOS);
        setThemeContext({ themeMode, isDarkMode });
        fetcher.submit(
            { themeMode, isDarkMode: isDarkMode + "" },
            { method: "get", action: `/theme` }
        );
    }

    useEffect(() => {
        window.document.querySelector("html")?.setAttribute("data-theme", getTheme(themeContext.isDarkMode));
    }, [themeContext]);

    useEffect(() => {
        setThemeMode(themeMode);
        // eslint-disable-next-line
    }, [isDarkOS]);

    return { isDarkMode, themeMode, setThemeMode };
}
