/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "node_modules/daisyui/dist/**/*.js",
        "node_modules/react-daisyui/dist/**/*.js",
        "./app/**/*.{ts,tsx,jsx,js}"
    ],
    theme: {
        extend: {},
        /**
         * See https://github.com/tailwindlabs/tailwindcss-aspect-ratio#compatibility-with-default-aspect-ratio-utilities
         */
        aspectRatio: {
            auto: "auto",
            square: "1 / 1",
            video: "16 / 9",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13",
            14: "14",
            15: "15",
            16: "16"
        }
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/aspect-ratio"),
        require("daisyui")
    ],

    daisyui: {
        darkTheme: "night",
        themes: ["light", "night"]
    }
};
