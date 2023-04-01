import * as React from "react";
import { SVGProps } from "react";

const SvgBoxplot = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 175 98" {...props}>
        <path
            fill="#5067A2"
            fillRule="nonzero"
            d="M165.206 4.859v38.872H145.77V14.577a4.859 4.859 0 0 0-4.859-4.859H72.885a4.859 4.859 0 0 0-4.859 4.859v68.026a4.859 4.859 0 0 0 4.859 4.859h68.026a4.859 4.859 0 0 0 4.86-4.859V53.449h19.435v38.872a4.859 4.859 0 1 0 9.718 0V4.859a4.859 4.859 0 1 0-9.718 0ZM58.308 14.577v68.026a4.859 4.859 0 0 1-4.859 4.859H34.013a4.859 4.859 0 0 1-4.859-4.859V53.449H9.718v38.872a4.859 4.859 0 1 1-9.718 0V4.859a4.859 4.859 0 1 1 9.718 0v38.872h19.436V14.577a4.859 4.859 0 0 1 4.859-4.859h19.436a4.859 4.859 0 0 1 4.859 4.859Z"
        />
    </svg>
);
export default SvgBoxplot;
