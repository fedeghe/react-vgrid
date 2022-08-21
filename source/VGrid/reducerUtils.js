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

__getGrouped = ({data, groups, opts}) => {
    const trak = {};
    if (opts.trak) trak.start = +new Date();
    // eslint-disable-next-line one-var
    const tmpGroupFlags = Array.from({length: data.length}, () => true),
        g = groups.reduce((acc, {label, grouper}) => {
            acc[label] = data.filter((row, i) => {
                if (!tmpGroupFlags[i]) return false;
                if (grouper && grouper(row)) {
                    tmpGroupFlags[i] = false;
                    return true;
                }
                return false;
            });
            return acc;
        }, {});

    // might be some data does not belong to any group
    g[opts.UNGROUPED] = data.filter((row, i) => tmpGroupFlags[i]);
    if (groups.length && g[opts.UNGROUPED].length) {
        console.warn(`[${opts.CMP.toUpperCase()} warning]: ${g[opts.UNGROUPED].length} elements are ungrouped`);
    }
    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__getGrouped spent ${trak.end - trak.start}ms`);
    }
    return g;
},

// this does not perform better
__getGrouped2 = ({data, groups, opts}) => {
    const trak = {};
    if (opts.trak) trak.start = +new Date();
    // eslint-disable-next-line one-var
    const g =  data.reduce((acc, d) => {
        const filter = groups.find(({grouper}) => grouper(d));
        if (filter) {
            if(!(filter.label in acc)) acc[filter.label] = [];
            acc[filter.label].push(d);
        } else {
            acc[opts.UNGROUPED].push(d);
        }
        return acc;
    }, {[opts.UNGROUPED]: []});
    if (groups.length && g[opts.UNGROUPED].length) {
        console.warn(`[${opts.CMP.toUpperCase()} warning]: ${g[opts.UNGROUPED].length} elements are ungrouped`);
    }
    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__getGrouped2 spent ${trak.end - trak.start}ms`);
    }
    return g;
},


__getVirtual = ({ dimensions, size, lineGap, grouping, grouped, scrollTop = 0}) => {
    console.log('grouping: ', grouping);
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