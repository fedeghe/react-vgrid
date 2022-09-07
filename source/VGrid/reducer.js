import React from 'react';
import { isFunction } from './utils';
import {
    __getFilterFactory, __cleanFilters,
    __getVirtual, __getVirtualGroup,
    __getGrouped, __composeFilters,
    __getFilteredCount,
    __applyFilter,
    uniqueID, trakTime,
    doWarn, doThrow
} from './reducerUtils';
import {
    CMPNAME, LINE_GAP, WIDTH, HEIGHT, ITEM_HEIGHT, ITEM_WIDTH,
    RHG_ID, DEBOUNCE_SCROLLING, DEBOUNCE_FILTERING,
    NO_FILTER_DATA_MESSAGE, GROUP_COMPONENT_HEIGHT,
    UNGROUPED_LABEL, FILTERS
} from './constants';

export const ACTION_TYPES = {
    LOADING: "LOADING",
    FILTER: "FILTER",
    UNFILTER_FIELDS: "UNFILTER_FIELDS",
    UNFILTER: "UNFILTER",
    SCROLL: "SCROLL",
};

// eslint-disable-next-line one-var
const actions = {
        [ACTION_TYPES.LOADING]: ({virtual}) => ({ virtual: { ...virtual, loading: true } }),

        [ACTION_TYPES.FILTER]: ({
            payload, originalData, globalFilterValue, filters,
            columns, filterFactory, dimensions, 
            grouping,  originalGroupedData, elementsPerLine, trakTimes,
            theDoFilterGlobal,
            virtual
        }) => {
            const {scrollTop, lineGap,} = virtual,
                { value, field } = payload,
                // must start from everything
                base = [...originalData],
                isGlobalSearch = !field,
                ret = {
                    theDoFilterGlobal
                };
            let _newData = base,
                _globalFilterValue = globalFilterValue,
                _newFilters = { ...filters };

            // first maybe update filter value
            if (!isGlobalSearch && field in _newFilters) {
                _newFilters = {
                    ..._newFilters,
                    [field]: {
                        ..._newFilters[field],
                        value
                    }
                };
            }
            // eslint-disable-next-line one-var
            const doFilter = __getFilterFactory({ columns, filters: _newFilters });

            // global ? 
            if (isGlobalSearch || _globalFilterValue) {
                if (isGlobalSearch) {
                    ret.globalFilterValue = value;
                    _globalFilterValue = value;

                    /**
                     * GROUPS
                     */
                    ret.theDoFilterGlobal = filterFactory(value);
                    //////////////////
                }

                _newData = _newData.filter(doFilter(_globalFilterValue));
            }
            //then use all available filters on their value (that is updated)
            _newData = _newData.filter(doFilter());

            // eslint-disable-next-line one-var
            const newTheDoFilter = doFilter(),
                /**
                 * GROUPED
                 */
                gData = __applyFilter({
                    globalValue: _globalFilterValue,
                    groupedData: originalGroupedData,
                    gFilter: ret.theDoFilterGlobal,
                    filter: newTheDoFilter,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                filtered = __getFilteredCount({ gData }),
                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    lineGap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                newVirtual = __getVirtual({
                    originalGroupedData,
                    gData,
                    filteredGroupedData,
                    elementsPerLine,

                    dimensions,
                    size: _newData.length,
                    scrollTop,
                    lineGap,
                    grouping
                }),
                { fromItem, toItem } = newVirtual;

            return {
                ...ret,
                data: _newData.slice(fromItem, toItem),
                filters: _newFilters,
                filteredData: _newData,
                filtered,
                theDoFilter: newTheDoFilter,
                virtual: {
                    ...virtual,
                    ...newVirtual,
                    scrollTop: 0
                },

                /**
                 * GROUP
                 */
                filteredGroupedData,
                theDoFilterGlobal: ret.theDoFilterGlobal
            };
        },

        [ACTION_TYPES.UNFILTER_FIELDS]: ({
            payload, globalFilterValue, filters, originalData, columns,
            trakTimes, dimensions, grouping,
            originalGroupedData, elementsPerLine, virtual
        }) => {
            let _globalFilterValue = globalFilterValue,
                _newFilters = { ...filters },
                _filteredData = [...originalData],
                theDoFilterGlobal;

            const filteringFields = payload.filter(f => columns.includes(f)),
                {scrollTop, lineGap} = virtual;

            filteringFields.forEach(f => { _newFilters[f].value = ''; });


            // eslint-disable-next-line one-var
            const filterFactory = __getFilterFactory({
                columns,
                filters: _newFilters,
                opts: { trakTimes, lib }
                }),
                theDoFilter = filterFactory();

            _filteredData = _filteredData.filter(theDoFilter);

            if (_globalFilterValue) {
                // this needs to be recreated every time the global filter changes
                theDoFilterGlobal = filterFactory(_globalFilterValue);
                _filteredData = _filteredData.filter(theDoFilterGlobal);
            }

            // eslint-disable-next-line one-var
            const gData = __applyFilter({
                    globalValue: _globalFilterValue,
                    groupedData: originalGroupedData,
                    gFilter: theDoFilterGlobal,
                    filter: theDoFilter,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),

                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    lineGap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                filtered = __getFilteredCount({ gData }),
                newVirtual = __getVirtual({
                    filteredGroupedData,
                    gData,
                    originalGroupedData,
                    elementsPerLine,

                    dimensions,
                    size: _filteredData.length,
                    scrollTop,
                    lineGap,
                    grouping
                }),
                    { fromItem, toItem } = newVirtual;

            return {
                filters: _newFilters,

                filteredData: _filteredData,
                data: _filteredData.slice(fromItem, toItem),
                globalFilterValue: _globalFilterValue,
                virtual: {
                    ...virtual,
                    ...newVirtual,
                },
                filtered,
                filteredGroupedData
            };
        },

        [ACTION_TYPES.UNFILTER]: ({
            payload, globalFilterValue, filters, originalData, columns,
            trakTimes, elementsPerLine, dimensions, originalGroupedData,
            grouping, virtual
        }) => {     
            let _globalFilterValue = globalFilterValue,
                _newFilters = { ...filters },
                _filteredData = [...originalData],
                theDoFilter = () => true,
                theDoFilterGlobal = () => true,
                filterFactory = __getFilterFactory({ columns, filters: _newFilters, opts: { trakTimes, lib } });
            const {lineGap }  = virtual;
            switch (payload) {
                case FILTERS.ALL:
                    _globalFilterValue = '';
                    _newFilters = __cleanFilters(filters);
                    filterFactory = __getFilterFactory({ columns, filters: _newFilters, opts: { trakTimes, lib } });
                    theDoFilter = filterFactory();
                    break;
                case FILTERS.GLOBAL:
                    _globalFilterValue = '';
                    theDoFilter = filterFactory();
                    // _filteredData = _filteredData.filter(theDoFilter);
                    break;
                case FILTERS.FIELDS:
                    _newFilters = __cleanFilters(filters);
                    theDoFilterGlobal = filterFactory(_globalFilterValue);
                    filterFactory = __getFilterFactory({ columns, filters: _newFilters, opts: { trakTimes, lib } });
                    _filteredData = _filteredData.filter(theDoFilterGlobal);
                    break;
            }

            // eslint-disable-next-line one-var
            const gData = __applyFilter({
                globalValue: _globalFilterValue,
                groupedData: originalGroupedData,
                gFilter: theDoFilterGlobal,
                filter: theDoFilter,
                elementsPerLine,
                opts: { trakTimes, lib }
            }),

                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    lineGap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                filtered = __getFilteredCount({ gData });
            // debugger
            return {
                filters: _newFilters,
                gData,
                filteredData: _filteredData,
                globalFilterValue: _globalFilterValue,
                filtered,
                theDoFilterGlobal,
                theDoFilter,
                filteredGroupedData,
                virtual: {
                    ...virtual,
                    scrollTop: 0
                }
            };

        },

        [ACTION_TYPES.SCROLL]: ({
            payload, dimensions, filteredData, grouping,
            globalFilterValue, originalGroupedData, theDoFilterGlobal, theDoFilter,
            elementsPerLine, trakTimes, virtual
        }) => {
            const scrollTop = parseInt(payload, 10),
                {lineGap} = virtual,
                gData = __applyFilter({
                    globalValue: globalFilterValue,
                    groupedData: originalGroupedData, // this needs to be the filtered data
                    gFilter: theDoFilterGlobal,
                    filter: theDoFilter,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    lineGap,
                    grouping,
                    grouped: gData,
                    scrollTop,
                    elementsPerLine,
                    opts: { trakTimes, lib }
                }),
                newVirtual = __getVirtual({
                    originalGroupedData,
                    gData,
                    filteredGroupedData,
                    elementsPerLine,

                    dimensions,
                    size: filteredData.length,
                    scrollTop,
                    lineGap,
                    grouping
                }),
                { fromItem, toItem } = newVirtual,
                
                
                rendering = filteredGroupedData.allocation.cardinality;
            return {
                data: filteredData.slice(fromItem, toItem),
                filteredGroupedData,
                rendering,
                
                virtual: {
                    ...virtual,
                    ...newVirtual,
                }
            };
        }
    },
    lib = CMPNAME,
    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                dimensions,
                originalData,
                filteredData,
                virtual,
                globalFilterValue,
                filters,

                columns,
                theDoFilter,
                theDoFilterGlobal,
                filterFactory,

                grouping,
                trakTimes,
                elementsPerLine,
                originalGroupedData
                // globalFilterValue
            } = oldState,

            params = {
                [ACTION_TYPES.LOADING]: {virtual},
                [ACTION_TYPES.FILTER]: {
                    payload, originalData, globalFilterValue, filters,
                    columns, filterFactory, dimensions,
                    grouping,  originalGroupedData, elementsPerLine, trakTimes,
                    virtual, theDoFilterGlobal
                },
                [ACTION_TYPES.UNFILTER_FIELDS]: {
                    payload, globalFilterValue, filters, originalData, columns,
                    trakTimes, dimensions, grouping,
                    originalGroupedData, elementsPerLine, virtual
                },
                [ACTION_TYPES.UNFILTER]: {
                    payload, globalFilterValue, filters, originalData, columns,
                    trakTimes, elementsPerLine, dimensions, originalGroupedData,
                    grouping, virtual
                },
                [ACTION_TYPES.SCROLL]: {
                    payload, dimensions, filteredData, grouping,
                    globalFilterValue, originalGroupedData, theDoFilterGlobal, theDoFilter,
                    elementsPerLine, trakTimes, virtual
                }
            }[type] || {};

        if (type in actions) {
            // console.log({type})
            const newState = {
                ...oldState,
                ...actions[type](params)
            };
            // console.log({newState});
            return newState;
        }
        return oldState;
    },

    init = (cnf = {}) => {
        if ('lineGap' in cnf && cnf.lineGap < 0) doThrow({ message: 'The parameter `lineGap` cannot be negative', opts: { lib } });
        const trak = { start: +new Date },
            {
                trakTimes = false,
                data = [],
                lineGap = LINE_GAP,
                Loader = () => (<div>loading</div>),
                dimensions: {
                    width = WIDTH,
                    height = HEIGHT,
                    itemHeight = ITEM_HEIGHT,
                    itemWidth = ITEM_WIDTH
                } = {},
                rhgID = RHG_ID,
                debounceTimes: {
                    scrolling = DEBOUNCE_SCROLLING,
                    filtering = DEBOUNCE_FILTERING,
                } = {},

                grouping: {
                    groups = [],
                    groupHeader: {
                        Component: GroupComponent = n => n,
                        height: groupComponentHeight = GROUP_COMPONENT_HEIGHT
                    } = {},
                    ungroupedLabel = UNGROUPED_LABEL,
                } = {},

                header: {
                    caption: {
                        Component: HeaderCaptionComponent = null,
                        height: headerCaptionHeight = 0
                    }
                } = {},
                footer: {
                    caption: {
                        Component: FooterCaptionComponent = null,
                        height: footerCaptionHeight = 0
                    }
                } = {},

                events: {
                    onItemEnter,
                    onItemLeave,
                    onItemClick,
                } = {},
                headers = {},
                globalPreFilter = '',
                NoFilterData = () => NO_FILTER_DATA_MESSAGE,
                cls: {
                    HeaderCaption: HeaderCaptionCls = null,
                    FooterCaption: FooterCaptionCls = null,
                } = {}
            } = cnf,
            /**
             * to know why read the comment in __getVirtualGroup */
            lineGapPlus = lineGap + 1,
            grouping = {
                groups,
                groupHeader: {
                    Component: GroupComponent,
                    height: groupComponentHeight
                },
                ungroupedLabel,
            },

            dimensions = {
                width,
                height,
                itemHeight, itemWidth,
                contentHeight: height - headerCaptionHeight - footerCaptionHeight
            },

            elementsPerLine = Math.floor(width / itemWidth),

            /***************************************************************************
             * starting from specified groups, separate the data and create the groups
             */
            originalGroupedData = __getGrouped({ data, groups, elementsPerLine, opts: { ungroupedLabel, lib, trakTimes } }),
            // originalGroupedData0 = __getGrouped({data, groups, elementsPerLine, opts: {ungroupedLabel, lib, trak: true}}),            
            funcFilters = __composeFilters({ headers, opts: { trakTimes, lib } }),

            // columns, filterFactory and theDoFilter can stay static in the state
            columns = headers.map(h => h.key),
            filterFactory = __getFilterFactory({ columns, filters: funcFilters, opts: { trakTimes, lib } }),
            theDoFilter = filterFactory(),

            // this needs to be recreated every time the global filter changes
            theDoFilterGlobal = filterFactory(globalPreFilter),

            gData = __applyFilter({
                globalValue: globalPreFilter,
                groupedData: originalGroupedData,
                gFilter: theDoFilterGlobal,
                filter: theDoFilter,
                elementsPerLine,
                opts: { trakTimes, lib }
            }),

            filteredGroupedData = __getVirtualGroup({
                dimensions,
                lineGap: lineGapPlus,
                grouping,
                grouped: gData,
                scrollTop: 0,
                elementsPerLine,
                opts: { trakTimes, lib }
            }),
            /**
             * 
             ****************************************************************************/

            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),

            innerVirtual = __getVirtual({
                originalGroupedData,
                gData,
                filteredGroupedData,
                elementsPerLine,

                dimensions,
                size: originalData.length,
                lineGap: lineGapPlus,
                scrollTop: 0
            }),

            virtual = {
                loading: false,
                lineGap: lineGapPlus,
                contentHeight: height - headerCaptionHeight - footerCaptionHeight,
                ...innerVirtual
            },
            // { fromItem, toItem } = innerVirtual,

            initialData = (
                globalPreFilter
                    ? originalData.filter(theDoFilterGlobal)
                    : originalData
            ).filter(theDoFilter);

        // console.log('originalGroupedData', originalGroupedData);
        // console.log('originalGroupedData0', originalGroupedData0)

        // console.log(originalGroupedData);
        // console.log(initialGroupedData);
        // what about order?
        // for (var g in originalGroupedData) {
        //     console.log(g, originalGroupedData[g].entries.length);
        // }
        // every group must have a grouper
        if (groups.length && groups.some(group => typeof group.grouper !== 'function')) {
            throw 'Every defined group must have a grouper function';
        }
        /////////////////////////////////////////////////////////////////////
        if (trakTimes) {
            trak.end = +new Date;
            trakTime({
                what: 'reducer initialization',
                time: trak.end - trak.start,
                opts: { trakTimes, lib }
            }
            );
        }
        return {
            ...cnf,
            rhgID,
            trakTimes,

            //ungrouped
            originalData: originalData,
            filteredData: [...initialData],

            // others data related fields which need a grouped correspondence
            // data: initialData.slice(fromItem, toItem),
            filtered: initialData.length,
            total: originalData.length,

            //grouped
            originalGroupedData,

            filteredGroupedData,

            elementsPerLine,
            theDoFilterGlobal,

            theDoFilter,
            filterFactory,
            columns,

            Loader,
            grouping,
            header: {
                HeaderCaptionComponent,
                headerCaptionHeight
            },
            footer: {
                FooterCaptionComponent,
                footerCaptionHeight
            },
            dimensions,
            virtual,
            debounceTimes: {
                scrolling,
                filtering,
            },
            events: {
                onItemEnter,
                onItemLeave,
                onItemClick,
            },
            filters: funcFilters,
            globalFilterValue: globalPreFilter,
            cls: {
                HeaderCaptionCls,
                FooterCaptionCls
            },
            NoFilterData
        };
    };

export default () => ({
    reducer,
    init
});