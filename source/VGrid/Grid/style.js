import { createUseStyles } from "react-jss";

export default createUseStyles({
    GridContainer: ({ height, width, headerCaptionHeight, footerCaptionHeight}) => ({
        maxWidth: `${width}px`,
        width: `${width}px`,
        height: `${height - headerCaptionHeight - footerCaptionHeight}px`,
        display:'flex',
        flexDirection:'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        overflow: 'scroll',
        scrollBehavior: 'smooth',
        padding: 0,
        margin: 0,
    }),
    Item: ({itemWidth, itemHeight}) => ({
        maxWidth: `${itemWidth}px`,
        width: `${itemWidth}px`,
        height: `${itemHeight}px`,
        // overflow: 'scroll',
        scrollBehavior: 'smooth',
        padding: 0,
        margin: 0,
    }),
    HeaderCaption: ({headerCaptionHeight}) => ({
        height: `${headerCaptionHeight}px`,
        position:'sticky',
        top: 0,
        '& > div':{
            height: `${headerCaptionHeight}px`,
        }
    }),
    FooterCaption: ({footerCaptionHeight}) => ({
        height: `${footerCaptionHeight}px`,
        position:'sticky',
        bottom: 0,
        '& > div':{
            height: `${footerCaptionHeight}px`,
        }
    })
});