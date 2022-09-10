import { createUseStyles } from "react-jss";

export default createUseStyles({
    Group: {
        fontWeight: 'bold',
        color:'red',
        display:'block',
        width:'100%',
        height: ({groupHeaderHeight}) => groupHeaderHeight,
        lineHeight: ({groupHeaderHeight}) => `${groupHeaderHeight}px`,
        paddingLeft:'10px'
    },
});