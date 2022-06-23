import React from 'react'
import generateRowData from './utils';
import Item from './sample/Item';
export default {
    data: generateRowData([
        { key: 'id', type: 'int' },
        { key: 'entityid', type: 'id' },
        { key: 'name', type: 'str' },
        { key: 'date', type: 'date' },
        { key: 'actions', type: 'str' },
        { key: 'id2', type: 'int' },
        { key: 'entityid2', type: 'int' },
        { key: 'name2', type: 'str' },
        { key: 'date2', type: 'date' },
        { key: 'id3', type: 'id' },
        { key: 'entityid3', type: 'int' },
        { key: 'name3', type: 'str' },
        { key: 'date3', type: 'date' },
    ], 1e3),
    filters: {
        id: ({userValue, row}) => row.id.includes(userValue) 
    },
    sorters: {
        nameMe: (itemA, itemB, direction) => {
            if (itemA.entityid === itemB.entityid) return 0;
            const v = itemA.entityid > itemB.entityid ? 1 : -1;
            return direction === 'asc' ? v : -v;
        }
    },
    Item,
    Loader: () => (<div className="Loading">loading</div>),
    dimensions: {
        itemWidth:200,
        itemHeight:300,
        width:1000,
        height:600
    },
    lineGap : 5,
    debounceTimes: {
        scrolling: 100
    }
};