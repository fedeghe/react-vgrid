import { createUseStyles } from "react-jss";

export default createUseStyles({
    Filler: ({height, width}) => ({
        display: 'block',
        height,
        width,
    }),
});