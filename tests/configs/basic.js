import generateRowData from './../../source/utils';
import Item from './../components/Item/item1'
export default {
    dimensions: {
        height: 800,
        width: 1000,
        itemWidth: 250,
        itemHeight: 200,
    },
    headers: [{
        key: 'id',
    },{
        key: 'name',
    },{
        key: 'entityid',
    }],
    Item,
    data: generateRowData([
        { key: 'id', type: 'int' },
        { key: 'entityid', type: 'id' },
        { key: 'name', type: 'str' }
    ], 50, true),
    gap: 0
};