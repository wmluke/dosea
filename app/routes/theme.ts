import type { LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { themeModeCookie } from "~/cookies";

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url);
    const themeMode = url.searchParams.get("themeMode") as string;
    const isDarkMode = url.searchParams.get("isDarkMode") as string;
    const value = [themeMode, isDarkMode];
    return new Response(JSON.stringify(value), {
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await themeModeCookie.serialize(value)
        }
    });
}
