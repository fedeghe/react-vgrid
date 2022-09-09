import { isFunction } from './utils';

let count = 0;
const prefix = 'HYG_',
    getLines = ({ entries, elementsPerLine }) => Math.ceil(entries.length / elementsPerLine),
    inRange = ({ n, from, to }) => n > from && n < to,

    /**
     * in both the functions do not destructure alloc
     * so to be able to not return anything but just update the referenced items
     */
    fixTopLineGap = ({allocation, groupKeys, lineGap}) => {
        
        const {firstRender} = allocation;

        let preIndex = firstRender.cursor,
            preGapCursor = lineGap,
            preTargetGroupLabel = firstRender.group;
        while(preTargetGroupLabel && preGapCursor--) {
            // maybe we need to seek for the previous group
            preIndex--;
            if (preIndex < 0) {
                preTargetGroupLabel = groupCloseby({groupKeys, label: preTargetGroupLabel, versus: -1});
                if (preTargetGroupLabel) {
                    preIndex = allocation.alloc[preTargetGroupLabel].length - 1;
                }
            }
            if (preTargetGroupLabel) {
                allocation.alloc[preTargetGroupLabel][preIndex].renders = true;
                allocation.firstRender.at = allocation.alloc[preTargetGroupLabel][preIndex].from;
            }
        }
    },
    /**
     * in both the functions do not destructure alloc
     * so to be able to not return anything but just update the referenced items
     */
    fixBottomLineGap = ({allocation, groupKeys, lineGap}) => {
        const {firstNotRender} = allocation;
        let postIndex = firstNotRender.cursor,    
            postTargetGroupLabel = firstNotRender.group,
            postGapCursor = lineGap,
            postGroupLastIndex = allocation.alloc[postTargetGroupLabel].length - 1;

        while(postTargetGroupLabel && postGapCursor--) {
            // maybe we need to seek for the next group
            if (postIndex > postGroupLastIndex) {
                postTargetGroupLabel = groupCloseby({groupKeys, label: postTargetGroupLabel, versus: 1});
                if (postTargetGroupLabel) {
                    postIndex = 0;
                    postGroupLastIndex = allocation.alloc[postTargetGroupLabel].length - 1;
                }
            }
            if (postTargetGroupLabel && postIndex <= postGroupLastIndex) {
                allocation.alloc[postTargetGroupLabel][postIndex].renders = true;                
                allocation.firstNotRender.at = allocation.alloc[postTargetGroupLabel][postIndex].to;
            }
            postIndex++;
        }
    },
    
    fixLineGap = ({allocation, groupKeys, lineGap}) => { 
        const {firstRender, firstNotRender} = allocation;
        if (!firstRender){ return allocation;}
        fixTopLineGap({allocation, groupKeys, lineGap});
        if (!firstNotRender) return allocation;
        fixBottomLineGap({allocation, groupKeys, lineGap});
        return allocation;
    },

    addFillers = ({allocation, carpetHeight}) => {
        allocation.topFillerHeight = allocation.firstRender?.at ? allocation.firstRender.at :  0;
        allocation.bottomFillerHeight = allocation.firstNotRender?.at ? carpetHeight - allocation.firstNotRender.at :  0;
        return allocation;
    },

    groupCloseby = ({groupKeys, label, versus}) => {
        const i = groupKeys.indexOf(label),
            len = groupKeys.length;
        // following
        if (versus > 0) {
            if (i === len - 1) return false;
            return i + 1 < len ? groupKeys[i + 1] : false;
        } else if (versus < 0) {
            if (i === 0) return false;
            return i - 1 >= 0 ? groupKeys[i - 1] : false;
        }
    };

// eslint-disable-next-line one-var
export const trakTime = ({ what, time, opts }) =>
    console.info(`%c${opts.lib.toUpperCase()} 🐢 ${what} spent ${time}ms`, 'color:DodgerBlue'),
    doWarn = ({ message, opts }) =>
        console.warn(`${opts.lib.toUpperCase()} 🙉 ${message}`),
    doThrow = ({ message, opts }) => {
        throw `${opts.lib.toUpperCase()} 🚨 ${message}`;
    },
    __getFilterFactory = ({ columns, filters, opts = {} }) => {

        const trak = opts.trakTimes ? { start: +new Date() } : null,
            { funcFilteredFields, valueFilteredFields } = columns.reduce((acc, f) => {
                acc[(f in filters) ? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
                return acc;
            }, { funcFilteredFields: [], valueFilteredFields: [] }),
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
            trakTime({ what: '__getFilterFactory', time: trak.end - trak.start, opts });
        }
        return ret;
    },


    __applyFilter = ({ globalValue, groupedData, gFilter, filter, elementsPerLine, opts = {} }) => {
        /**
         * {
         *      [groupName]: {
         *          entries: [{...}],
         *          lines: #of lines for that group
         *      }
         * }
         */
        const trak = opts.trakTimes ? { start: +new Date() } : null,
            groupNames = Object.keys(groupedData),
            initialGroupedDataGobalFiltered = globalValue
                ? groupNames.reduce((acc, groupName) => {
                    const entries = groupedData[groupName].entries.filter(gFilter);
                    acc[groupName] = {
                        entries,
                        lines: getLines({ entries, elementsPerLine })
                    };
                    return acc;
                }, {})
                : groupedData,
            ret = groupNames.reduce((acc, groupName) => {
                const entries = initialGroupedDataGobalFiltered[groupName].entries.filter(filter);
                acc[groupName] = {
                    entries,
                    lines: getLines({ entries, elementsPerLine })
                };
                return acc;
            }, {});
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({ what: '__applyFilter', time: trak.end - trak.start, opts });
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


    __composeFilters = ({ headers, opts = {} }) => {
        const trak = opts.trakTimes ? { start: +new Date() } : null,
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
            trakTime({ what: '__composeFilters', time: trak.end - trak.start, opts });
        }
        return ret;
    },

    __getFilteredCount = ({gData}) => Object.values(gData).reduce((acc, v) => acc + v.entries.length, 0),

    /**
     * If we loop over filters and for each filter we loop over all data (even skipping the entries
     * already included somewhere, check __getGrouped0) it is a way slower compared to 
     * looping on each entry and find the first filter get it (if any)
     */
    __getGrouped = ({ data, groups, elementsPerLine, opts = {} }) => {
        // console.log({groups});
        const trak = opts.trakTimes ? { start: +new Date() } : null,
            g = data.reduce((acc, d) => {
                const filter = groups.find(({ grouper }) => grouper(d));
                if (filter) {
                    if (!(filter.label in acc)) acc[filter.label] = [];
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
        if (groups.length && g[opts.ungroupedLabel].length) {
            doWarn({ message: `${g[opts.ungroupedLabel].length} elements are ungrouped`, opts });
        }
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({ what: '__getGrouped2', time: trak.end - trak.start, opts });
        }
        // return group entries & lines filtering out empty groups
        return Object.entries(g).reduce((acc, [name, groupEntries]) => {
            if (groupEntries.length) {
                acc[name] = {
                    entries: groupEntries,
                    lines: getLines({ entries: groupEntries, elementsPerLine }),
                    
                };
            } else {
                name !== opts.ungroupedLabel
                && doWarn({ message: `group named \`${name}\` is empty thus ignored`, opts });
            }
            return acc;
        }, {});
    },

    // most of those params will be removed
    __getVirtual = ({
        originalGroupedData, gData, filteredGroupedData,
        dimensions, size, lineGap, scrollTop = 0,
        elementsPerLine
    }) => {

        const { height, itemHeight, width, itemWidth } = dimensions,
            {
                groupingDimensions: {carpetHeight },
                allocation: {
                    cardinality,
                    renderedItems,
                    renderedHeaders,
                    headerHeight
                }
            } = filteredGroupedData,

            linesToRender = Math.ceil(renderedItems / elementsPerLine),
            dataHeight = linesToRender * itemHeight + renderedHeaders * headerHeight;
        return {
            carpetHeight,
            linesToRender,
            
            dataHeight,

            cardinality,
            renderedItems,

            loading: false,
            scrollTop,
        };
    },

    /**
     * the next step for this function is to skip all elements not rendering
     * still considering the lineGap
     */
    __getVirtualGroup = ({ dimensions, lineGap, grouping, grouped, scrollTop, elementsPerLine, opts = {} }) => {
        let renderedItems = 0,
            renderedHeaders = 0,
            dataHeight = 0;
        const trak = opts.trakTimes ? { start: +new Date() } : null,
            { contentHeight, itemHeight, height } = dimensions,
            { groupHeader, groups, ungroupedLabel } = grouping,
            
            groupKeys = Object.keys(grouped),

            /**
             * flag to spot the case no named groups are set
             * in that case there will be only the the `ungroupedLabel` labelled group
             * and the header should be ignored
             */
            onlyUngrouped = groupKeys.length === 1 && groupKeys[0] === ungroupedLabel,

            headerHeight = onlyUngrouped ? 0 : groupHeader.height,
            /**
             * cumpute each group dimension including the header and sum up to get the carpetHeight
             */
            groupingDimensions = Object.entries(grouped).reduce((acc, [groupName, group]) => {
                /**
                 * if there is no data then we should skip it, but
                 * __getGrouped ,which returns what here we get as 'groouped',
                 * automatically skips groups that do not contain any data
                 * thus we can skip it (see the 'impossible' group in configSmall)
                 * 
                 * if (!groupData.entries.length) return acc;
                 */
                
                // the header should have no height for groups with no lines
                const groupHeight = group.lines ? group.lines * itemHeight + headerHeight : 0;

                acc.carpetHeight += groupHeight;
                acc.groupsHeights[groupName] = groupHeight;
                return acc;
            }, { carpetHeight: 0, groupsHeights: {} }),
            { carpetHeight } = groupingDimensions,

            // group here brings the right order given in the config
            // here on first instance we scan through aiming to find the starting&ending element to 
            // include (considering headers and lines)
            range = { from: scrollTop, to: scrollTop + contentHeight },
            headerHeight2 =  headerHeight/2,
            itemHeight2 = itemHeight/2,
            

            allocation = Object.entries(grouped).reduce((acc, [label, group]) => {
                /** 
                 * Here we can be sure that all the groups will have a
                 * positive height at least equal to one line (itemHeight)
                 * ---------------------------------
                 * linegap + 1 set in the reducer: why ? 
                 * 
                 * linegap by default is the constant LINE_GAP (currently 2)
                 * as edge case let's suppose it's set to 0; the inRange function checks
                 * if n is in the viewport (range) and n is passed as the mean vertical point
                 * allowing to make only 2 comparisons but,  if only the lower 40% or the item (line)
                 * appears at the top of the viewport it will not result within the range 
                 * and this would be a problem, to solve it we can
                 * - use a 4 comparison rangeInRange function instead of inRange to check if
                 *   the top of the line is in the range OR the bottom is in the range (4 comparison)
                 * - use the less expensive inRange and use lineGap+1 so that when we take lineGap
                 *   into account we basically render one more element at the top and at the bottom
                 * the second option might do the whole 'inRange' check on average in half the time
                 * thus is the choosen option
                 */
                // console.log({groupingDimensions})
                let { cursor, firstRender, firstNotRender } = acc;
                const headerRenders = inRange({n: cursor + headerHeight2, ...range}),
                    groupHeight = groupingDimensions.groupsHeights[label];
                /**
                 * here flattening can be excluded despite it would make a way easier
                 * to apply after the lineGap logic
                 * 
                 * the reason is that group label hash is needed cause afterward 
                 * the group elements sorting turn straightforward,
                 * instead if flattened would be quite a nightmare
                 */   
                 acc.alloc[label] = onlyUngrouped ? [] : [{
                    header: true, //is a header
                    from: cursor,
                    to: cursor + headerHeight,
                    renders: headerRenders,
                }];  
                
                acc.alloc[label].push(
                    ...Array.from({length: group.lines}, (_, i) => {
                        const from = cursor + headerHeight + i * itemHeight,
                            renders = inRange({n: from + itemHeight2, ...range}),
                            j = onlyUngrouped ? i : i+1;
                        /**
                         * cursor tracks that is a line (>=0) or a header (-1)
                         */
                        if (!firstRender && renders) {
                            firstRender = {
                                group: label,
                                cursor: headerRenders ? 0 : j // account the header at index 0
                            };
                            acc.firstRender = firstRender;
                        }

                        /**
                         * if the first render has been tracked
                         * then check for the first non render
                         **/
                        if (firstRender && !firstNotRender && (!renders)){
                            firstNotRender = {
                                group: label,
                                cursor: !headerRenders && !i ? 0: j // consider the header at index 0
                            };
                            acc.firstNotRender = firstNotRender;
                        }
                        return {
                            from,
                            to: from + itemHeight,
                            renders,
                            rows: grouped[label].entries.slice(i * elementsPerLine, (i+1)* elementsPerLine) // is a line
                        };
                    })
                );        
                acc.cursor += groupHeight;
                return acc;
            }, {
                alloc: {}, 
                cursor: 0,
                firstRender: null,
                firstNotRender: null,
            }),
            
            /**
             * now we need still to do a small thing on allocation cause we need to
             * - use lineGap and firstRender and firstNotRender
             *   to turn true the rendering of the right elements
             * - calculate topFillerHeight and bottomFillerHeight
             * 
             * notice that after doing the right thing with lineGap, we can cleanup allocation
             * removing all elements that do not render 
             **/
            gappedAllocationUnfiltered = fixLineGap({allocation, groupKeys, lineGap }),
            withFillersAllocation  = addFillers({allocation: gappedAllocationUnfiltered, carpetHeight}),
            filteredAlloc = Object.entries(withFillersAllocation.alloc)
                .reduce((acc, [label, entries]) => {
                    // somehow the filter breaks
                    const e = entries;//.filter(z => z.renders);

                    // do not render groups with only the header
                    if (e.length > 1 || onlyUngrouped) {
                        acc[label] = e;
                        // renderedItems += e.reduce((acc, c) => (
                        //      acc + ((c.renders && !c.header) ? c.rows.length : 0)
                        // ), 0);
                        e.forEach(c => {
                            // renderedHeaders
                            renderedHeaders += ~~(c.header && c.renders);

                            // renderedItems
                            renderedItems += ((c.renders && !c.header) ? c.rows.length : 0);

                            // dataHeight
                            dataHeight += c.renders ? (c.header ? headerHeight : (itemHeight * c.rows.length)) : 0;
                        });


                    }
                    return acc;
                }, {}),
            ret = {
                groupingDimensions,
                allocation: {
                    ... withFillersAllocation,
                    alloc: filteredAlloc,
                    renderedItems,
                    renderedHeaders,
                    dataHeight,
                    headerHeight
                }
            };
        
           
        if (opts.trakTimes) {
            trak.end = +new Date();
            trakTime({ what: '__getVirtualGroup', time: trak.end - trak.start, opts });
        }
        return ret;
    },

    uniqueID = {
        toString: () => {
            count += 1;
            return prefix + count;
        }
    };