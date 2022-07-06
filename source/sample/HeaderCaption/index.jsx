import React from 'react';
import useStyles from './style';

const HeaderCaption = ({
    globalFilter, globalFilterValue,
    filtered, maxRenderedItems,
    filters, resetFilters
}) => {
    const classes = useStyles();
    return (
        <div>
            <div className={classes.Line}>
                <div>
                    <input placeholder="global search" value={globalFilterValue} type="text" onChange={
                        e => globalFilter({value: e.target.value})}
                    />
                </div>
                <div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={()=>resetFilters('_GLOBAL_')}>&times; global</button>
                    &nbsp;
                    <button type="button" className="btn btn-secondary btn-sm" onClick={()=>resetFilters('_FIELDS_')}>&times; filters</button>
                    &nbsp;
                    <button type="button" className="btn btn-secondary btn-sm" onClick={()=>resetFilters('_ALL_')}>&times; all</button>
                </div>
            </div>
            <div className={classes.Line}>
                <div>
                    <input placeholder="id search" value={filters.id.value} type="text" onChange={e => globalFilter({value: e.target.value, field: 'id'})}/>
                    &nbsp;
                    <input placeholder="entityId search" value={filters.entityid.value} type="text" onChange={e => globalFilter({value: e.target.value, field: 'entityid'})}/>
                    &nbsp;
                    <input placeholder="name search" value={filters.name.value} type="text" onChange={e => globalFilter({value: e.target.value, field: 'name'})}/>
                </div>
                <div>listing {filtered} elements ({maxRenderedItems} max rendered)</div> 
            </div>
        </div>
    );
};
export default HeaderCaption;