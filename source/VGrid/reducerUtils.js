import { isFunction } from './utils';

let count = 0;
const prefix = 'HYG_';
// eslint-disable-next-line one-var
export const __getFilterFactory = ({columns, filters}) => {
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

__applyFilter = ({globalValue, groupedData, gFilter, filter}) => {
    const groupNames = Object.keys(groupedData),
        initialGroupedDataGobalFiltered = globalValue
                ? groupNames.reduce((acc, groupName) => {
                    acc[groupName] = groupedData[groupName].filter(gFilter);
                    return acc;
                }, {})
                : groupedData;
    return groupNames.reduce((acc, groupName) => {
        acc[groupName] = initialGroupedDataGobalFiltered[groupName].filter(filter);
        return acc;
    }, {});
}, 

__cleanFilters = _filters => Object.keys(_filters).reduce((acc, k) => {
    acc[k] = {
        filter: _filters[k].filter,
        value: ''
    };
    return acc;
}, {}),

__composeFilters = ({headers}) => headers.reduce((acc, header) => {
    // in case a header has a filter, use it
    if (isFunction(header.filter)) {
        acc[header.key] = {
            filter: header.filter,
            value: header.preFiltered || ''
        };
    // otherwise let data pass
    } else {
        acc[header.key] = {
            filter: () => true,
            value: ''
        };
    }
    return acc;
}, {}),

__getGrouped = ({data, groups, opts}) => {
    const trak = opts.trak ? {start: +new Date()} : null,
        
        tmpGroupFlags = Array.from({length: data.length}, () => true),

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

    // might be` some data does not belong to any group
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

// this does NOT perform better
__getGrouped2 = ({data, groups, opts}) => {
    const trak = opts.trak ? {start: +new Date()} : null,
        g =  data.reduce((acc, d) => {
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
__getVirtualGroup = ({ dimensions, lineGap, grouping, grouped, scrollTop}) => {
    console.log(grouped)
    console.log(grouping)
    // common things
    const { height, itemHeight, width, itemWidth } = dimensions,
        columns = Math.floor(width / itemWidth),
        groupHeader = grouping.group,
        groupsDimensions = Object.entries(grouped).reduce((acc, [groupName, groupData]) => {
            const size = groupData.length,
                groupLines = Math.ceil(size / columns),
                groupHeight = groupLines * itemHeight + groupHeader.height;
            acc.carpetHeight += groupHeight;
            acc.groupsHeights[groupName] = groupHeight;
            return acc;
        }, {carpetHeight: 0, columns, groupsHeights: {}}),

        topFillerHeight= 0,
        bottomFillerHeight = 0;

    return {
        groupsDimensions,

        topFillerHeight,
        bottomFillerHeight,
        renderingGroups: [{
            name: 'the name',
            group: [/* the raw data, only the one that needs to be rendered*/],
            includeHeader: true // or false
        }]
    };
},

uniqueID = {
    toString: () => {
        count += 1;
        return prefix + count;
    }
};