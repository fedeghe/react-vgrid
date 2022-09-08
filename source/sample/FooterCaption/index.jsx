import React from 'react'
import useStyles from './style';
const FooterCaption = ({
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
                <strong>footer caption</strong> ({filtered} filtered) {loading && ' loading'}
            </div>
            <div>
                content: {contentHeight} | data: {dataHeight} | carpet: {carpetHeight}
            </div>
        </div>
    );
};
export default FooterCaption;