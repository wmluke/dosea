import type { SVGProps } from "react";
import * as React from "react";

const SvgDataZoom = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 175 83" {...props}>
        <path
            fill="#5067A2"
            fillRule="nonzero"
            d="m9.2 18.42.01-4.606v4.605h32.233v46.048H9.21V18.42H9.2ZM133.54 64.466V18.42h32.233v46.048H133.54ZM165.772 9.21H133.54V4.605a4.605 4.605 0 1 0-9.21 0V9.21H50.653V4.605a4.605 4.605 0 0 0-9.21 0V9.21H9.21C4.135 9.21 0 13.345 0 18.42v46.047c0 5.084 4.135 9.21 9.21 9.21h32.233v4.604a4.605 4.605 0 0 0 9.21 0v-4.604h73.676v4.604a4.605 4.605 0 1 0 9.21 0v-4.604h32.233a9.21 9.21 0 0 0 9.21-9.21V18.42c0-5.074-4.126-9.21-9.21-9.21Z"
        />
    </svg>
);
export default SvgDataZoom;
