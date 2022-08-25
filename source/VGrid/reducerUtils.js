import { isFunction } from './utils';

let count = 0;
const prefix = 'HYG_',
    getLines = ({entries, elementsPerLine}) => Math.ceil(entries.length / elementsPerLine);
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

__applyFilter = ({globalValue, groupedData, gFilter, filter, elementsPerLine, opts = {}}) => {
    /**
     * {
     *      [groupName]: {
     *          entries: [{...}],
     *          lines: #of lines for that group
     *      }
     * }
     */
    const trak = opts.trak ? {start: +new Date()} : null,
        groupNames = Object.keys(groupedData),
        initialGroupedDataGobalFiltered = globalValue
                ? groupNames.reduce((acc, groupName) => {
                    const entries = groupedData[groupName].entries.filter(gFilter)
                    acc[groupName] = {
                        entries,
                        lines: getLines({entries, elementsPerLine})
                    };
                    return acc;
                }, {})
                : groupedData,
        ret = groupNames.reduce((acc, groupName) => {
            const entries = initialGroupedDataGobalFiltered[groupName].entries.filter(filter);
            acc[groupName] = {
                entries,
                lines: getLines({entries, elementsPerLine})
            };
            return acc;
        }, {});
    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__applyFilter spent ${trak.end - trak.start}ms`);
    }
    return ret;
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


__getGrouped = ({data, groups, elementsPerLine, opts = {}}) => {
    const trak = opts.trak ? {start: +new Date()} : null,
        
        tmpGroupFlags = Array.from({length: data.length}, () => true),

        g = groups.reduce((acc, {label, grouper}) => {
            const entries = data.filter((row, i) => {
                if (!tmpGroupFlags[i]) return false;
                if (grouper && grouper(row)) {
                    tmpGroupFlags[i] = false;
                    return true;
                }
                return false;
            });
            if (entries.length){
                acc[label] = {
                    entries,
                    lines: getLines({entries, elementsPerLine})
                };
            } else {
                console.warn(`[${opts.lib.toUpperCase()} warning]: group named \`${label}\` is empty thus ignored`);
            }
            return acc;
        }, {}),
        // might be` some data does not belong to any group
        outcast = data.filter((row, i) => tmpGroupFlags[i]);


    g[opts.ungroupedLabel] = {
        entries: outcast,
        lines: getLines({entries: outcast, elementsPerLine})
    };
    if (groups.length && g[opts.ungroupedLabel].entries.length) {
        console.warn(`[${opts.lib.toUpperCase()} warning]: ${g[opts.ungroupedLabel].entries.length} elements are ungrouped`);
    }
    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__getGrouped spent ${trak.end - trak.start}ms`);
    }
    return g;
},

/**
 * Quite not surprisingly looping on each entry and find the first filter get it (if any)
 * does perform better.... 
 */
__getGrouped2 = ({data, groups, elementsPerLine, opts = {}}) => {
    const trak = opts.trak ? {start: +new Date()} : null,
        g =  data.reduce((acc, d) => {
            const filter = groups.find(({grouper}) => grouper(d));
            if (filter) {
                if(!(filter.label in acc)) acc[filter.label] = {entries: []};
                acc[filter.label].entries.push(d);
            } else {
                acc[opts.ungroupedLabel].entries.push(d);
            }
            return acc;
        }, {[opts.ungroupedLabel]: {entries: []}});

    if (groups.length && g[opts.ungroupedLabel].entries.length) {
        console.warn(`[${opts.lib.toUpperCase()} warning]: ${g[opts.ungroupedLabel].entries.length} elements are ungrouped`);
    }
    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__getGrouped2 spent ${trak.end - trak.start}ms`);
    }
    return Object.entries(g).reduce((acc, [name, group]) => {
        acc[name] = {
            ...group,
            lines: getLines({entries: group.entries, elementsPerLine})
        };
        return acc;
    }, {});
},


__getVirtual = ({ dimensions, size, lineGap, grouping, grouped, scrollTop = 0}) => {
    
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

__getVirtualGroup = ({ dimensions, lineGap, grouping, grouped, scrollTop, elementsPerLine, opts = {}}) => {
    console.log('grouped: ', grouped)
    console.log('grouping: ', grouping)
    // common things
    const trak = opts.trak ? {start: +new Date()} : null,
        { height: contentHeight, itemHeight, width, itemWidth } = dimensions,
        groupHeader = grouping.group,
        groupingDimensions = Object.entries(grouped).reduce((acc, [groupName, group]) => {
            /**
             * if there is no data then we should skip it, but
             * __getGrouped ,which returns what here we get as 'groouped',
             * automatically skips groups that do not contain any data
             * thus we can skip it (see the 'impossible' group in configSmall)
             * 
             * if (!groupData.entries.length) return acc;
             */ 

            const groupHeight = group.lines * itemHeight + groupHeader.height;

            acc.carpetHeight += groupHeight;
            acc.groupsHeights[groupName] = groupHeight;
            return acc;
        }, {carpetHeight: 0, groupsHeights: {}}),

        renderingGroups = Object.entries(groupingDimensions.groupsHeights).reduce(
            (acc, [groupName, groupHeight]) => {
                /** 
                 * Here we can be sure that all the groups will have a
                 * positive height at least equal to one line (itemHeight)
                 * 
                 * Clearly not all groups will go in acc.groups cause we need
                 * to put only those ones which have rendering relevant elements
                 */
                
                acc.groups.push({
                    name: groupName,
                    group: grouped[groupName], // each has {entries, lines}
                    includeHeader: true // or false
                });
                return acc;
            },
            {
                groups: [],
                topFillerHeight: 0
            }
        );

    /** 
     * In case one only group is there the header must be skipped,
     * regardless is the opts.UNGROUPED
     * or a user named single group containing all data
     */
    if (renderingGroups.groups.length === 1) {
        renderingGroups.groups[0].includeHeader = false;
    }

    if (opts.trak) {
        trak.end = +new Date();
        console.log(`__getVirtualGroup spent ${trak.end - trak.start}ms`);
    }
    return {
        groupingDimensions,
        renderingGroups,
        topFillerHeight: 0,
        bottomFillerHeight: 0,
    };
},

uniqueID = {
    toString: () => {
        count += 1;
        return prefix + count;
    }
};