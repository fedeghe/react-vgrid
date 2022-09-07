import React from 'react'
import useStyles from './style';
const FooterCaption = ({
    globalFilter, globalFilterValue,
    filtered, renderedItems,
    loading,
    filters,
    dataHeight,
            carpetHeight,
            contentHeight,
}) => {
    const classes = useStyles();
    return (
        <div className={["FooterCaption", classes.Container].join(' ')}>
            <div>
                footer caption ({filtered} filtered) {loading && ' loading'}
            </div>
            <div>
                content: {contentHeight} | data: {dataHeight} | carpet: {carpetHeight}
            </div>
        </div>
    );
};
export default FooterCaption;