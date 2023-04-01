import type { SVGProps } from "react";
import * as React from "react";

const SvgLine = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 175 138" {...props}>
        <g fill="#5067A2" fillRule="nonzero">
            <path
                d="M25.274 111.656a4.584 4.584 0 0 0 3.783-1.988L69.36 51.435l39.282 43.148a4.602 4.602 0 0 0 7.225-.543l51.284-76.457a4.602 4.602 0 1 0-7.64-5.127l-48.016 71.579L72.278 40.96a4.648 4.648 0 0 0-3.709-1.5 4.63 4.63 0 0 0-3.479 1.978l-43.599 63a4.602 4.602 0 0 0 3.783 7.217" />
            <path
                d="M170.272 127.855H9.204V5.005a4.602 4.602 0 0 0-9.204 0v127.452a4.602 4.602 0 0 0 4.602 4.602h165.67a4.602 4.602 0 0 0 4.602-4.602c0-2.542-2.06-3.2-4.602-3.2" />
        </g>
    </svg>
);
export default SvgLine;
