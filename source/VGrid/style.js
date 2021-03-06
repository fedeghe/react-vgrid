import { createUseStyles } from "react-jss";

export default createUseStyles({
    Wrapper : ({width, height}) => ({
        height,
        width,
        overflow: 'hidden',
        position:'relative'
    }),
    LoaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
    }
});