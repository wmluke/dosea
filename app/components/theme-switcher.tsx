import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "~/hooks/use-theme";

export function ThemeSwitcher() {
    const { isDarkMode, themeMode, setThemeMode } = useTheme();

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0}>
                <button className="btn btn-ghost drawer-button btn-square normal-case">
                    {isDarkMode ?
                        <SunIcon className="h-6 w-6" /> :
                        <MoonIcon className="h-6 w-6" />
                    }
                </button>
            </label>
            <ul tabIndex={0}
                className="dropdown-content menu menu-compact p-2 shadow bg-base-100 rounded-box w-25">
                <li>
                    <button
                        className={themeMode === "light" ? "active" : ""}
                        onClick={() => setThemeMode("light")}>
                        <SunIcon className="h-6 w-6" />
                        Light
                    </button>
                </li>
                <li>
                    <button
                        className={themeMode === "dark" ? "active" : ""}
                        onClick={() => setThemeMode("dark")}>
                        <MoonIcon className="h-6 w-6" />
                        Dark
                    </button>
                </li>
                <li>
                    <button
                        className={themeMode === "system" ? "active" : ""}
                        onClick={() => setThemeMode("system")}>
                        <ComputerDesktopIcon className="h-6 w-6" />
                        System
                    </button>
                </li>
            </ul>
        </div>
    );
}
