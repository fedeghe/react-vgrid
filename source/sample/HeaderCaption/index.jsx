import React from 'react';
import useStyles from './style';

const HeaderCaption = ({
    globalFilter, globalFilterValue,
    filtered, renderedItems, total,
    filters, resetFilters,
    loading,
    downloadJson,
    downloadXsv
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
                {loading && <div className="spinner-grow spinner-grow-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>}&nbsp;
                <button type="button" className="btn btn-secondary btn-sm" onClick={downloadJson}>▼ json</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadXsv()}>▼ csv</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadXsv({separator: "\t"})}>▼ tsv</button>
            
                    <button title="reset global filter only" type="button" className="btn btn-secondary btn-sm"
                        onClick={()=>resetFilters('GLOBAL')}>&times; global</button>
                    &nbsp;
                    <button title="reset all fields filter only" type="button" className="btn btn-secondary btn-sm"
                        onClick={()=>resetFilters('FIELDS')}>&times; filters</button>
                    &nbsp;
                    <button title="reset all filters" type="button" className="btn btn-secondary btn-sm"
                        onClick={()=>resetFilters('ALL')}>&times; all</button>
                    &nbsp;
                    <button title="reset id & name filters" type="button" className="btn btn-secondary btn-sm"
                        onClick={()=>resetFilters(['id','name'])}>&times; id, name</button>
                    &nbsp;
                    <button title="reset id & entityid filters" type="button" className="btn btn-secondary btn-sm"
                        onClick={()=>resetFilters(['id','entityid'])}>&times; id, entityid</button>
                </div>
            </div>
            <div className={classes.Line}>
                <div>
                    <input placeholder="id search" value={filters.id.value} type="text"
                        onChange={e => globalFilter({value: e.target.value, field: 'id'})}/>
                    &nbsp;
                    <input placeholder="entityId search" value={filters.entityid.value} type="text"
                        onChange={e => globalFilter({value: e.target.value, field: 'entityid'})}/>
                    &nbsp;
                    <input placeholder="name search" value={filters.name.value} type="text"
                        onChange={e => globalFilter({value: e.target.value, field: 'name'})}/>
                </div>
                <div>virt. {filtered} out of {total} ({renderedItems} rendered)</div> 
            </div>
        </div>
    );
};
export default HeaderCaption;