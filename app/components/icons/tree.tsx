import type { SVGProps } from "react";
import * as React from "react";

const SvgTree = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 174 147" {...props}>
        <defs>
            <path id="a" d="M2 4.696h170v141.679H2z" />
        </defs>
        <g fill="none" fillRule="evenodd">
            <path
                fill="#5067A2"
                fillRule="nonzero"
                d="M174 127.496c-.006 10.432-8.466 18.885-18.898 18.88-10.432-.006-18.885-8.467-18.88-18.9v-.018c.005-8.702 5.896-16.023 13.905-18.21V80.256H91.462v28.864c8.279 2.006 14.429 9.462 14.427 18.357v.02c-.006 10.431-8.467 18.884-18.898 18.879-10.433-.006-18.885-8.467-18.88-18.9.001-8.711 5.894-16.035 13.907-18.222V80.256H23.353v28.865c8.278 2.007 14.426 9.462 14.425 18.356v.006c-.002 10.432-8.46 18.888-18.892 18.886C8.454 146.367 0 137.909 0 127.477c.001-8.713 5.895-16.038 13.909-18.223V80.256c0-5.206 4.234-9.444 9.444-9.444h58.665V37.818c-8.017-2.187-13.911-9.52-13.906-18.23C68.112 9.15 76.57.695 87.002.696c10.432.002 18.889 8.46 18.887 18.892v.02c-.005 8.89-6.153 16.338-14.426 18.344v32.86h58.664c5.21 0 9.444 4.238 9.444 9.444v28.857c8.282 2.006 14.433 9.466 14.429 18.364v.02Z"
            />
        </g>
    </svg>
);
export default SvgTree;