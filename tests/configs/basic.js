import Item from './../components/Item/item1'
import data from './../data/dataSmall.json'
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
    data,
    gap: 0
};