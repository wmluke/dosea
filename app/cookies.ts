import { createCookie } from "@remix-run/node";

export const themeModeCookie = createCookie("themeMode", {
    sameSite: "lax",
    path: "/",
    httpOnly: false,
    secure: false
});
