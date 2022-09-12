import React from 'react';
import generateRowData from './utils';
import Item from './sample/Item/item1';
import HeaderCaption from './sample/HeaderCaption';
import FooterCaption from './sample/FooterCaption';
import GroupComponent from './sample/GroupComponent';
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
    ], 1e2+1),

    // each gouper must exclusively select an element,
    // if two grouper let the same row pass then a specific
    // exception will be thrown
    grouping: {
        groups: [{
            label: 'lower',
            grouper: (row) => row.id <= 100
        },{
            label: 'mid',
            grouper: (row) => row.id >100 && row.id <= 200
        },{
            label: 'high',
            grouper: (row) => row.id >200 && row.id <= 400

        //the impossible
        // },{
        //     label: 'impossible',
        //     grouper: (row) => row.id >= Infinity && row.id <= 300

        // the alone, or the remainder collector
        // },{
        //     label: 'alone',
        //     grouper: (row) => row.id >= -Infinity

        }],
        // ungroupedLabel: 'Un-grouped',
        groupHeader: {
            Component: GroupComponent,
            height:50
        },
        collapsible: true
    },

    headers: [{
        key: 'id',
        filter: ({userValue, row}) => `${row.id}`.startsWith(userValue),
        // preFiltered: 2,
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
        itemHeight: 200,
        width: 1000,
        height: 800
    },
    gap : 3,
    NoFilterData: ({total}) => <div>no data out of {total}</div>,
    debounceTimes: {
        // scrolling: 20,
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
    events: {
        // onItemEnter: (e, {item}) => {console.log('enter Item ', item);},
        // onItemLeave: (e, {item}) => {console.log('leave Item ', item);},
        // onItemClick: (e, {item}) => {console.log('click Item ', item);},
    },
    cls: {
        HeaderCaption: 'HeaderCaption',
        FooterCaption: 'FooterCaption',
    },
    // trakTimes : true,  //default false
    warning: 1 // 0 none, 1 warning, 2 warning + error
};