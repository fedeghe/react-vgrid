import React from 'react'
import useStyles from './style';
const FooterCaption = ({
    filtered, renderedItems, renderedHeaders,
    loading,
    filters,
    dataHeight,
    carpetHeight,
    contentHeight,
    total,
}) => {
    const classes = useStyles();
    return (
        <div className={["FooterCaption", classes.Container].join(' ')}>
            <div>
                <strong>footer caption</strong> (filtered: {filtered} | rendered Items: {renderedItems}:{renderedHeaders}| total: {total}) {loading && ' loading'}
            </div>
            <div>
                content: {contentHeight} | data: {dataHeight} | carpet: {carpetHeight}
            </div>
        </div>
    );
};
export default FooterCaption;