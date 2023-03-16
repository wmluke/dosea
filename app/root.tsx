import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react";

import appStylesheetUrl from "./styles/app.css";

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: appStylesheetUrl },
        { rel: "stylesheet", href: require("react-grid-layout/css/styles.css") },
        { rel: "stylesheet", href: require("react-resizable/css/styles.css") },
    ];
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "Databot",
    viewport: "width=device-width,initial-scale=1,
});

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            {title ? <title>{title}</title> : null}
            <Meta />
            <Links />
        </head>
        <body className="relative flex min-h-screen w-full bg-gray-900 text-gray-200">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
        </body>
        </html>
    );
}

export default function App() {
    return (
        <Document>
            <Outlet />
        </Document>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 401:
        case 404:
            return (
                <Document title={`${caught.status} ${caught.statusText}`}>
                    <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4">
                        <h1>
                            {caught.status} {caught.statusText}
                        </h1>
                    </div>
                </Document>
            );

        default:
            throw new Error(`Unexpected caught response with status: ${caught.status}`);
    }
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
