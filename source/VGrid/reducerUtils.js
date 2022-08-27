import { isFunction } from './utils';

let count = 0;
const prefix = 'HYG_',
    getLines = ({entries, elementsPerLine}) => Math.ceil(entries.length / elementsPerLine),



    /**
     * 
     *                  false
     * +----from----+.........  scrollTop
     * |            |
     * |            |
     * |            |
     * |            |  true
     * |            |
     * |            |
     * +----to------+ ........  scrollTop + contentHeight
     * 
     *                  null      
     * 
     */
     getAllocation = ({cursor, range, groupDimensions, groupLines, itemHeight}) => {
        console.log({cursor, range, groupDimensions, groupLines, itemHeight});
        const {from, to} = range;
        if (cursor > to) return null;
        return cursor >= from;
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


    __getGrouped = ({data, groups, elementsPerLine, opts = {}}) => {
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
            outcast = data.filter((row, i) => tmpGroupFlags[i]);


        g[opts.ungroupedLabel] = {
            entries: outcast,
            lines: getLines({entries: outcast, elementsPerLine})
        };
        if (groups.length && g[opts.ungroupedLabel].entries.length) {
            doWarn({message: `${g[opts.ungroupedLabel].entries.length} elements are ungrouped`, opts});
        }
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getGrouped', time: trak.end - trak.start, opts});
        }
        return g;
    },


    /**
     * Quite not surprisingly looping on each entry and find the first filter get it (if any)
     * does perform better.... 
     */
    __getGrouped2 = ({data, groups, elementsPerLine, opts = {}}) => {
        const trak = opts.trakTimes ? {start: +new Date()} : null,
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
            // console.warn(`${opts.lib.toUpperCase()} 🙉 : ${g[opts.ungroupedLabel].entries.length} elements are ungrouped`);
            doWarn({message: `${g[opts.ungroupedLabel].entries.length} elements are ungrouped`, opts});
        }
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({what: '__getGrouped2', time: trak.end - trak.start, opts});
            
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
        const trak = opts.trakTimes ? {start: +new Date()} : null,
            { height: contentHeight, itemHeight, width, itemWidth } = dimensions,
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
                /** 
                 * Here we can be sure that all the groups will have a
                 * positive height at least equal to one line (itemHeight)
                 * 
                 * Clearly not all groups will go in acc.groups cause we need
                 * to put only those ones which have rendering relevant elements
                 */
                let {cursor, alloc} = acc;
                console.log('GROUP', grouped[label])
                const group = grouped[label],
                    /**
                     *  ranging: {
                     *      counts // boolean
                     *      cursor // updated
                     *      header // boolean
                     *      from // integer
                     *      to // integer
                     *  }
                     */
                    ranging = getAllocation({
                        cursor, range,
                        groupDimensions: groupingDimensions.groupsHeights[label],
                        groupLines: group.lines,
                        itemHeight
                    });

                // initialise the alloc map for the group
                alloc[label] = [{
                    header: ranging,
                    lines: 3
                }];
        

                // MAYBE
                // acc.groups.push({
                //     label,
                //     group,
                //     includeHeader: true
                // });

                acc.alloc = alloc;
                return acc;
            }, {
                groups: [],
                alloc: {}, // label : [{h: bool}, {lines: num}, {h: bool}, {lines: num}, .....],
                allocStart: null,
                allocEnd: null,
                cursor: 0
            });

        /** 
         * In case one only group is there the header must be skipped,
         * regardless is the opts.UNGROUPED
         * or a user named single group containing all data
         */
        if (renderingGroups.groups.length === 1) {
            renderingGroups.groups[0].includeHeader = false;
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