/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
    cacheDirectory: "./node_modules/.cache/remix",
    ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
    serverDependenciesToBundle: [
        /^echarts.*/,
        /^zrender.*/,
        "@sindresorhus/slugify",
        "@sindresorhus/transliterate",
        "escape-string-regexp"
    ],
    // servermoduleformat: "esm",
    future: {
        unstable_tailwind: false,
        v2_routeConvention: true
    }
};
