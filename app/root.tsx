import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { themeModeCookie } from "~/cookies";
import type { ThemeMode } from "~/hooks/use-theme";
import { getTheme, ThemeContext } from "~/hooks/use-theme";

import appStylesheetUrl from "./styles/app.css";

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: appStylesheetUrl },
        { rel: "stylesheet", href: require("react-grid-layout/css/styles.css") },
        { rel: "stylesheet", href: require("react-resizable/css/styles.css") }
    ];
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "Dosea",
    viewport: "width=device-width,initial-scale=1"
});


export type DocumentProps = {
    children: ReactNode;
    title?: string;
    isDarkMode?: boolean
    themeMode?: ThemeMode
};

function Document({ children, title, isDarkMode = false, themeMode = "system" }: DocumentProps) {
    return (
        <ThemeContext.Provider value={{ isDarkMode, themeMode }}>
            <html lang="en" data-theme={getTheme(isDarkMode)}>
            <head>
                <meta charSet="utf-8" />
                {title ? <title>{title}</title> : null}
                <Meta />
                <Links />
                <script defer data-domain="dosea-7b28.fly.dev" src="https://plausible.io/js/script.js"></script>
            </head>
            <body className="relative flex min-h-screen w-full">
            {children}
            <ScrollRestoration />
            <Scripts />
            {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
            </body>
            </html>
        </ThemeContext.Provider>
    );
}

export async function loader({ request }: LoaderArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const [themeMode = "system", isDarkModeString = "false"] = await themeModeCookie.parse(cookieHeader) ?? [];

    return json({
        themeMode,
        isDarkMode: isDarkModeString === "true"
    } as { isDarkMode: boolean, themeMode: ThemeMode });
}

export default function App() {
    const { isDarkMode, themeMode } = useLoaderData<typeof loader>();
    return (
        <Document isDarkMode={isDarkMode} themeMode={themeMode}>
            <Outlet />
        </Document>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    return (
        <Document title={`${caught.status} ${caught.statusText}`}>
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4">
                <h1>
                    {caught.status} {caught.statusText}
                </h1>
            </div>
        </Document>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);

    return (
        <Document title="Uh-oh!">
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4">
                <h1>Sorry, something went wrong...</h1>
            </div>
        </Document>
    );
}
