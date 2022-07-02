import React from 'react';
import generateRowData from './utils';
import Item from './sample/Item';
export default {
    data: generateRowData([
        { key: 'id', type: 'int' },
        { key: 'entityid', type: 'id' },
        { key: 'name', type: 'str' },
        // { key: 'date', type: 'date' },
        // { key: 'actions', type: 'str' },
        // { key: 'id2', type: 'int' },
        // { key: 'entityid2', type: 'int' },
        // { key: 'name2', type: 'str' },
        // { key: 'date2', type: 'date' },
        // { key: 'id3', type: 'id' },
        // { key: 'entityid3', type: 'int' },
        // { key: 'name3', type: 'str' },
        // { key: 'date3', type: 'date' },
    ], 1e5),
    filters: {
        id: ({userValue, row}) => 
            userValue.length === 0
            || `${row.id}` === userValue
    },
    // sorters: {
    //     nameMe: (itemA, itemB, direction) => {
    //         if (itemA.entityid === itemB.entityid) return 0;
    //         const v = itemA.entityid > itemB.entityid ? 1 : -1;
    //         return direction === 'asc' ? v : -v;
    //     }
    // },
    Item,
    Loader: () => (<div className="Loading">loading</div>),
    dimensions: {
        itemWidth: 250,
        itemHeight: 230,
        width: 1250,
        height: 800
    },
    lineGap : 2,
    NoFilterData: ({total}) => <div>no data out of {total}</div>,
    debounceTimes: {
        scrolling: 10,
        // filtering: 200,
    },
    headerCaption: {
        Component: ({globalFilter, globalFilterValue, filtered, maxRenderedItems, rendered, filters}) => (<div>
            <p>
                Search: <input value={globalFilterValue} type="text" onChange={
                    e => globalFilter({value: e.target.value})}
                /> 
                 -
                Search id only: <input value={filters.id.value} type="text" onChange={
                    e => globalFilter({value: e.target.value, field: 'id'})
                }/> listing {filtered} elements ({maxRenderedItems} max rendered, {rendered} rendered)</p>
        </div>),
        height: 45
    },

    footerCaption: {
        Component: ({filtered}) => (<div className="FooterCaption">footer caption ({filtered} filtered)</div>),
        height: 25
    },


    // events: {
    //     onItemEnter: (e, {item}) => {console.log('enter Item ', item);},
    //     onItemLeave: (e, {item}) => {console.log('leave Item ', item);},
    //     onItemClick: (e, {item}) => {console.log('click Item ', item);},
    // }

    cls: {
        HeaderCaption: 'HeaderCaption',
        FooterCaption: 'FooterCaption',
    }

};