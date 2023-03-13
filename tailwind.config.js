/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "node_modules/daisyui/dist/**/*.js",
        "node_modules/react-daisyui/dist/**/*.js",
        "./app/**/*.{ts,tsx,jsx,js}"
    ],
    theme: {
        extend: {}
    },
    plugins: [require('@tailwindcss/typography'), require("daisyui")],

    daisyui: {
        themes: ["night", "night", "aqua"]
    }
};
