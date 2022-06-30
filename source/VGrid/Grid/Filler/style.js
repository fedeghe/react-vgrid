import { createUseStyles } from "react-jss";

export default createUseStyles({
    Filler: ({height, width}) => ({
        display: height ? 'block' : 'none',
        height,
        width,
    }),
});