import { useMatches } from "@remix-run/react";
import { useMemo, useState } from "react";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
    to: FormDataEntryValue | string | null | undefined,
    defaultRedirect: string = DEFAULT_REDIRECT
) {
    if (!to || typeof to !== "string") {
        return defaultRedirect;
    }

    if (!to.startsWith("/") || to.startsWith("//")) {
        return defaultRedirect;
    }

    return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
    const matchingRoutes = useMatches();
    const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
    return route?.data;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };
    return [storedValue, setValue] as const;
}

export function notFound(message?: string) {
    return new Response(null, {
        status: 404,
        statusText: ["Not Found", message].filter(Boolean).join(": ")
    });
}

export function badRequest(message?: string) {
    return new Response(null, {
        status: 400,
        statusText: ["Bad Request", message].filter(Boolean).join(": ")
    });
}

export function joinTruthy(strs: Array<string | number | undefined | null>, separator: string): string {
    return strs.filter(Boolean).join(separator);
}

export function classNames(...classes: Array<string | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + " ..." : str;
}

export function isEmpty(o?: Object | Array<any> | string | null): boolean {
    return !o || Object.keys(o).length === 0;
}

export type ConvertDatesToStrings<T> = T extends Date
    ? string
    : T extends Array<infer U>
        ? ConvertDatesToStrings<U>[]
        : T extends object
            ? { [K in keyof T]: ConvertDatesToStrings<T[K]> }
            : T;

/**
 * `URL` in chrome has issues with non-standard protocols, so need to manually
 * pull out the creds from the full url.
 * See https://bugs.chromium.org/p/chromium/issues/detail?id=869291
 */
export function sanitizeConnectionUrl(connection?: string) {
    if (connection && connection.includes("@")) {
        const proto = connection.split(":").shift();
        const rhs = connection.split("@").pop();
        return `${proto}://${rhs}`;
    }
    return connection;
}

export function daysAgo(days = 0) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
}
