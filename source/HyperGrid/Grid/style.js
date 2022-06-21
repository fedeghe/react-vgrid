import { createUseStyles } from "react-jss";

export default createUseStyles({
    GridContainer: ({ height, width}) => ({
        maxWidth: `${width}px`,
        width: `${width}px`,
        height: `${height}px`,
        display:'flex',
        flexDirection:'row',
        flexWrap: 'wrap',
        overflow: 'scroll',
        scrollBehavior: 'smooth',
        padding: 0,
        margin: 0,
    }),
    Item: ({itemWidth, itemHeight}) => ({
        maxWidth: `${itemWidth}px`,
        width: `${itemWidth}px`,
        height: `${itemHeight}px`,
        overflow: 'scroll',
        scrollBehavior: 'smooth',
        padding: 0,
        margin: 0,
    })
});