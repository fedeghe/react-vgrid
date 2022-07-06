import React from 'react'

const FooterCaption = ({
    globalFilter, globalFilterValue,
    filtered, maxRenderedItems,
    loading,
    filters,
    fromItem, toItem
}) =>(
    <div className="FooterCaption">
        [{fromItem}, {toItem}] 
        footer caption ({filtered} filtered)
        {loading && ' loading'}
    </div>
);
export default FooterCaption;