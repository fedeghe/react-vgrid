import { isFunction } from './utils';

let count = 0;
const prefix = 'HYG_',
    getLines = ({entries, elementsPerLine}) => Math.ceil(entries.length / elementsPerLine),
    inRange = ({n, from, to}) => n > from && n <= to,
    /**                                           
     *                                          CASE 0
     *                                          +-----------+ cursor
     *                                          |           |
     *                                          +-----------+ cursor + groupHeight = cursorEnd
     * 
     *                                          CASE 1
     *                                          +-----------+
     * +-range.from-+ scrollTop    - - - - - - -|- - - - - -|- - - - 
     * |            |                           +-----------+
     * |            |
     * |            |                           CASE 2
     * |            |                           +-----------+
     * |            |                           |           |
     * |            |                           +-----------+
     * |            |
     * |            |                           CASE 3
     * |            |                           +-----------+
     * +--range.to--+ scrollTop +   - - - - - - |- - - - - -|- - - -
     *                contentHeight             +-----------+                                         
     * 
     *                                          CASE 4
     *                                          +-----------+
     *                                          |           |
     *                                          +-----------+
     *  returns
     * 
     *  ranging: {
     *      renders // boolean
     *      cursor // updated
     *      header // boolean
     *      items: {
     *          from // int
     *          to // int
     *      }
     *  }
     */
    getAllocation = ({
        label, cursor, range, lineGap, groupHeight, headerHeight,
        height, carpetHeight,
        groupLines, itemHeight, elementsPerLine
    }) => {
        const cursorEnd = cursor + groupHeight;
        console.log(`Get allocation for group: ${label}`);
        console.log({cursor, range, lineGap, groupHeight, headerHeight, height, carpetHeight, groupLines, itemHeight, elementsPerLine});
        // case 0 
        if (cursorEnd < range.from) {console.log(`${label} : group 0`);} else
        if (cursor <= range.from && inRange({n: cursor, ...range})) {console.log(`${label} : group 1`);} else
        if (inRange({n: cursorEnd, ...range}) && inRange({n: cursor, ...range})) {console.log(`${label} : group 2`);} else
        if (cursor > range.to && inRange({n: cursor, ...range})) {console.log(`${label} : group 3`);} else
        if (cursor > range.to && cursorEnd > range.to) {console.log(`${label} : group 4`);}
    
        
        // eslint-disable-next-line one-var
        const ret = {
            label,
            renders: true,
            cursor: 0,
            header: false,
            items: {from: 0, to: 0}
        };
        // rendered ? if not skip the rest

        return ret;
    };    

// eslint-disable-next-line one-var
export const trakTime = ({what, time, opts}) =>
        console.info(`%c${opts.lib.toUpperCase()} 🐢 ${what} spent ${time}ms`, 'color:DodgerBlue'),
    doWarn = ({message, opts}) =>
        console.warn(`${opts.lib.toUpperCase()} 🙉 ${message}`),
    __getFilterFactory = ({columns, filters, opts ={}}) => {

        const trak = opts.trakTimes ? {start: +new Date()} : null,
            {funcFilteredFields, valueFilteredFields} = columns.reduce((acc, f) => {
                acc[(f in filters)? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
                return acc;
            }, {funcFilteredFields: [], valueFilteredFields: []}),
            ret = global => row => 
                funcFilteredFields[global ? 'some' : 'every'](fk => 
                    filters[fk].filter({
                        userValue: global || filters[fk].value,
                        row
                    })
                )
                ||
                valueFilteredFields.some(f => `${row[f]}`.includes(global));

        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getFilterFactory', time: trak.end - trak.start, opts});
        }
        return ret;
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
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            groupNames = Object.keys(groupedData),
            initialGroupedDataGobalFiltered = globalValue
                    ? groupNames.reduce((acc, groupName) => {
                        const entries = groupedData[groupName].entries.filter(gFilter);
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
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__applyFilter', time: trak.end - trak.start, opts});
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


    __composeFilters = ({headers, opts = {}}) => {
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            ret = headers.reduce((acc, header) => {
                
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
            }, {});
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__composeFilters', time: trak.end - trak.start, opts});
        }
        return ret;
    },

    /**
     * NOT PERFORMING BETTER
     */
    __getGrouped0 = ({data, groups, elementsPerLine, opts = {}}) => {
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            
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

                // skip empties and warn
                if (entries.length){
                    acc[label] = {
                        entries,
                        lines: getLines({entries, elementsPerLine})
                    };
                } else {
                    doWarn({message: `group named \`${label}\` is empty thus ignored`, opts});
                }
                return acc;
            }, {}),
            // might be` some data does not belong to any group
            outcasts = data.filter((row, i) => tmpGroupFlags[i]);
        
        // out outcasts in the right place and warn
        if(outcasts.length) {
            g[opts.ungroupedLabel] = {
                entries: outcasts,
                lines: getLines({entries: outcasts, elementsPerLine})
            };
            doWarn({message: `${outcasts.length} elements are ungrouped`, opts});
        }
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getGrouped', time: trak.end - trak.start, opts});
        }
        return g;
    },


    /**
     * If we loop over filters and for each filter we loop over all data (even skipping the entries
     * already included somewhere) it is a way slower compared to 
     * looping on each entry and find the first filter get it (if any)
     */
    __getGrouped = ({data, groups, elementsPerLine, opts = {}}) => {
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            g =  data.reduce((acc, d) => {
                const filter = groups.find(({grouper}) => grouper(d));
                if (filter) {
                    if(!(filter.label in acc)) acc[filter.label] = [];
                    acc[filter.label].push(d);
                } else {
                    acc[opts.ungroupedLabel].push(d);
                }
                return acc;
            }, {
                // be sure to mantain the original order
                ...groups.reduce((acc, g) => {
                    acc[g.label] = [];
                    return acc;
                }, {}),
                [opts.ungroupedLabel]: []
            });
        
        if (groups.length && g[opts.ungroupedLabel].entries.length) {
            doWarn({message: `${g[opts.ungroupedLabel].entries.length} elements are ungrouped`, opts});
        }
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getGrouped2', time: trak.end - trak.start, opts});
        }
        // return group entries & lines filtering out empty groups
        return Object.entries(g).reduce((acc, [name, groupEntries]) => {
            if (groupEntries.length) {
                acc[name] = {
                    entries: groupEntries,
                    lines: getLines({entries: groupEntries, elementsPerLine})
                };
            } else {
                doWarn({message: `group named \`${name}\` is empty thus ignored`, opts});
            }
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
        console.log('grouped: ', grouped);
        console.log('grouping: ', grouping);
        console.log('check groups name order: ', Object.keys(grouped));
        // common things
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            { height: contentHeight, itemHeight, height  } = dimensions,
            {groupHeader, groups} = grouping,
            {height : headerHeight} = groupHeader,
            // groupHeader = grouping.group,
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
            { carpetHeight } = groupingDimensions,

            // group here brings the right order given in the config
            // here on first instance we scan through aiming to find the starting&ending element to 
            // include (considering headers and lines)
            range = {from: scrollTop, to: scrollTop + contentHeight},
            renderingGroups = Object.keys(grouped).reduce((acc, label) => {
                // console.log(' G ', label)
                /** 
                 * Here we can be sure that all the groups will have a
                 * positive height at least equal to one line (itemHeight)
                 * 
                 * Clearly not all groups will go in acc.groups cause we need
                 * to put only those ones which have rendering relevant elements
                 */
                let {cursor} = acc;
                // console.log('GROUP', grouped[label]);
                const group = grouped[label],
                    /**
                     *  ranging: {
                     *      renders // boolean: renders something, header and/or items; if false ignore the rest
                     *      header // boolean: renders the header
                     *      from // integer: in case not both 0, then renders some items
                     *      to // integer  : 
                     * 
                     *      cursor // updated, just operational role to keep track of the current
                     *  }
                     */
                    groupHeight = groupingDimensions.groupsHeights[label],
                    ranging = getAllocation({
                        label,
                        cursor, range, lineGap,
                        groupHeight,
                        groupLines: group.lines,
                        headerHeight,
                        itemHeight,
                        height, carpetHeight,
                        elementsPerLine
                    });

                // maybe initialise the alloc map for the group
                if (ranging.renders) {
                    acc.alloc[label] = ranging;
                }
                acc.cursor += groupHeight;
                return acc;
            }, {
                alloc: {}, // label : [{h: bool}, {lines: num}, {h: bool}, {lines: num}, .....],
                cursor: 0
            }),
            renderingOnes = Object.values(renderingGroups.alloc).filter(a => a.renders);

        /** 
         * In case one only group is there the header must be skipped,
         * regardless is the opts.UNGROUPED
         * or a user named single group containing all data
         */
        if (renderingOnes.length === 1) {
            renderingGroups.alloc[renderingOnes[0].label].header = false;
        }

        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getVirtualGroup', time: trak.end - trak.start, opts});
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