import React from 'react';
import generateRowData from './utils';
import Item from './sample/Item';
import HeaderCaption from './sample/HeaderCaption';
import FooterCaption from './sample/FooterCaption';
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

    headers: [{
        key: 'id',
        filter: ({userValue, row}) => `${row.id}`.startsWith(userValue),
        preFiltered: '',
    },{
        key: 'name',
        filter: ({userValue, row}) => `${row.name}`.includes(userValue),
        preFiltered: null,
    },{
        key: 'entityid',
        filter: ({userValue, row}) => `${row.entityid}`.includes(userValue),
        preFiltered: null,
    }],

    // globalPreFilter: '2',


    Item,
    Loader: () => (<div className="Loading">loading</div>),
    dimensions: {
        itemWidth: 250,
        itemHeight: 230,
        width: 1000,
        height: 800
    },
    lineGap : 2,
    NoFilterData: ({total}) => <div>no data out of {total}</div>,

    debounceTimes: {
        // scrolling: 10,
        // filtering: 200,
    },


    header: {
        caption: {
            Component: HeaderCaption,
            height: 100
        }
    },
    footer: {
        caption: {
            Component: FooterCaption,
            height: 25
        }
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