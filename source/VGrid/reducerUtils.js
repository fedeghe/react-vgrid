let count = 0;
const prefix = 'HYG_';
// eslint-disable-next-line one-var
export const __getDoFilter = ({columns, filters}) => {
    const {funcFilteredFields, valueFilteredFields} = columns.reduce((acc, f) => {
        acc[(f in filters)? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
        return acc;
    }, {funcFilteredFields: [], valueFilteredFields: []});
    return  v => row => 
        funcFilteredFields[v ? 'some' : 'every'](fk => 
            filters[fk].filter({
                userValue: v || filters[fk].value,
                row
            })
        )
        ||
        valueFilteredFields.some(f => `${row[f]}`.includes(v));
},

__cleanFilters = _filters => Object.keys(_filters).reduce((acc, k) => {
    acc[k] = {
        filter: _filters[k].filter,
        value: ''
    };
    return acc;
}, {}),

__getVirtual = ({ dimensions, size, lineGap, grouping, grouped, scrollTop = 0}) => {
    console.log('grouping: ', grouping,);
    console.log('grouped: ', grouped);

    const { height, itemHeight, width, itemWidth } = dimensions,
        columns = Math.floor(width / itemWidth),
        lines = Math.ceil(size / columns),
        carpetHeight = lines * itemHeight,
            //take into accounts groups-1 * groupComponentHeight
            // + (grouping.groups.length - 1) * grouping.group.height,
        trigger = scrollTop > (lineGap + 1) * itemHeight,

        topLinesSkipped = Math.max(0, Math.floor(scrollTop / itemHeight) - lineGap),

        topFillerHeight = topLinesSkipped * itemHeight,
        linesToRender = 2 * lineGap + Math.ceil(height / itemHeight),
        dataHeight = linesToRender * itemHeight,
        maxRenderedItems = columns * linesToRender,
        bottomFillerHeight = Math.max(carpetHeight - topFillerHeight - dataHeight, 0),
        fromItem = trigger
            ? topLinesSkipped * columns
            : 0,
        toItem = trigger ? fromItem + maxRenderedItems : linesToRender * columns;
    return {
        fromItem,
        toItem,
        carpetHeight,
        topFillerHeight,
        bottomFillerHeight,
        linesToRender,
        dataHeight,
        maxRenderedItems,
        loading: false,
        lines,
        columns,
        scrollTop,
    };
},
uniqueID = {
    toString: () => {
        count += 1;
        return prefix + count;
    }
};