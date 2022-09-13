
import {
    doThrow, uniqueID, trakTime,
    doWarn, throwIf, isFunction
} from './utils';
import {
    __getFilterFactory, __cleanFilters, __getVirtual, __getVirtualGroup,
    __getGrouped, __composeFilters, __applyFilter
} from './reducerUtils';
import {
    CMPNAME, GAP, WIDTH, HEIGHT, ITEM_HEIGHT, ITEM_WIDTH,
    RVG_ID, DEBOUNCE_SCROLLING, DEBOUNCE_FILTERING,
    NO_FILTER_DATA_MESSAGE, GROUP_COMPONENT_HEIGHT,
    UNGROUPED_LABEL, FILTERS, DEFAULT_LOADER, UIE,
    GLOBAL_FILTER, WARNING
} from './constants';

const LOADING = Symbol(),
    FILTER = Symbol(),
    UNFILTER_FIELDS = Symbol(),
    UNFILTER = Symbol(),
    SCROLL = Symbol(),
    TOGGLE_GROUP = Symbol();


// eslint-disable-next-line one-var
export const ACTION_TYPES = {
    LOADING,
    FILTER,
    UNFILTER_FIELDS,
    UNFILTER,
    TOGGLE_GROUP,
    SCROLL,
};

// eslint-disable-next-line one-var
const actions = {
        [LOADING]: ({virtual}) => ({ virtual: { ...virtual, loading: true } }),
        [TOGGLE_GROUP]: ({payload, originalGroupedData}) => ({
            originalGroupedData : {
                ...originalGroupedData,
                [payload] : {
                    ...originalGroupedData[payload],
                    collapsed: !originalGroupedData[payload].collapsed 
                }
            }
        }),

        [FILTER]: ({
            payload, globalFilterValue, filters,
            columns, filterFactory, dimensions, 
            grouping,  originalGroupedData, elementsPerLine,
            theDoFilterGlobal,
            virtual, globalFilter, opts
        }) => {
            const {scrollTop, gap,} = virtual,
                { value, field } = payload,
                // must start from everything
                isGlobalSearch = !field,
                ret = {
                    theDoFilterGlobal
                };
            let _globalFilterValue = globalFilterValue,
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

            }

            // eslint-disable-next-line one-var
            const doFilter = __getFilterFactory({ columns, filters: _newFilters, globalFilter }),
                newTheDoFilter = doFilter(),
                /**
                 * GROUPED
                 */
                {gData, filtered} = __applyFilter({
                    globalValue: _globalFilterValue,
                    groupedData: originalGroupedData,
                    gFilter: ret.theDoFilterGlobal,
                    filter: newTheDoFilter,
                    elementsPerLine,
                    opts
                }),

                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    gap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    originalGroupedData,
                    opts
                }),
                newVirtual = __getVirtual({
                    filteredGroupedData,
                    elementsPerLine,
                    dimensions,
                    scrollTop
                });
            return {
                ...ret,
                filters: _newFilters,
                filtered,
                theDoFilter: newTheDoFilter,
                virtual: {
                    ...virtual,
                    ...newVirtual,
                    scrollTop: 0
                },
                filteredGroupedData,
                theDoFilterGlobal: ret.theDoFilterGlobal
            };
        },

        [UNFILTER_FIELDS]: ({
            payload, globalFilterValue, filters, columns,
            dimensions, grouping,
            originalGroupedData, elementsPerLine, virtual,
            globalFilter, opts
        }) => {
            let _globalFilterValue = globalFilterValue,
                _newFilters = { ...filters },
                theDoFilterGlobal;

            const filteringFields = payload.filter(f => columns.includes(f)),
                {scrollTop, gap} = virtual;

            filteringFields.forEach(f => { _newFilters[f].value = ''; });


            // eslint-disable-next-line one-var
            const filterFactory = __getFilterFactory({
                    columns,
                    filters: _newFilters,
                    globalFilter,
                    opts
                }),
                theDoFilter = filterFactory();

            if (_globalFilterValue) {
                // this needs to be recreated every time the global filter changes
                theDoFilterGlobal = filterFactory(_globalFilterValue);
            }

            // eslint-disable-next-line one-var
            const {gData, filtered} = __applyFilter({
                    globalValue: _globalFilterValue,
                    groupedData: originalGroupedData,
                    gFilter: theDoFilterGlobal,
                    filter: theDoFilter,
                    elementsPerLine,
                    opts
                }),

                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    gap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    originalGroupedData,
                    opts
                }),
                newVirtual = __getVirtual({
                    filteredGroupedData,
                    elementsPerLine,
                    dimensions,
                    scrollTop
                });

            return {
                filters: _newFilters,
                globalFilterValue: _globalFilterValue,
                virtual: {
                    ...virtual,
                    ...newVirtual,
                },
                filtered,
                filteredGroupedData
            };
        },

        [UNFILTER]: ({
            payload, globalFilterValue, filters, columns,
            elementsPerLine, dimensions, originalGroupedData,
            grouping, virtual, globalFilter, opts
        }) => {     
            let _globalFilterValue = globalFilterValue,
                _newFilters = { ...filters },
                theDoFilter = () => true,
                theDoFilterGlobal = () => true,
                filterFactory = __getFilterFactory({ columns, filters: _newFilters, globalFilter, opts});
            const {gap }  = virtual;
            switch (payload) {
                case FILTERS.ALL:
                    _globalFilterValue = '';
                    _newFilters = __cleanFilters(filters);
                    filterFactory = __getFilterFactory({ columns, filters: _newFilters, globalFilter, opts});
                    theDoFilter = filterFactory();
                    break;
                case FILTERS.GLOBAL:
                    _globalFilterValue = '';
                    theDoFilter = filterFactory();
                    break;
                case FILTERS.FIELDS:
                    _newFilters = __cleanFilters(filters);
                    theDoFilterGlobal = filterFactory(_globalFilterValue);
                    filterFactory = __getFilterFactory({ columns, filters: _newFilters, globalFilter, opts});
                    break;
            }

            // eslint-disable-next-line one-var
            const {gData, filtered} = __applyFilter({
                    globalValue: _globalFilterValue,
                    groupedData: originalGroupedData,
                    gFilter: theDoFilterGlobal,
                    filter: theDoFilter,
                    elementsPerLine,
                    originalGroupedData,
                    opts
                }),

                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    gap,
                    grouping,
                    grouped: gData,
                    scrollTop: 0,
                    elementsPerLine,
                    originalGroupedData,
                    opts
                });

            return {
                filters: _newFilters,
                gData,
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

        [SCROLL]: ({
            payload, dimensions, grouping,
            globalFilterValue, originalGroupedData, theDoFilterGlobal, theDoFilter,
            elementsPerLine, virtual, opts
        }) => {
            const scrollTop = parseInt(payload, 10),
                {gap} = virtual,
                {gData} = __applyFilter({
                    globalValue: globalFilterValue,
                    groupedData: originalGroupedData, // this needs to be the filtered data
                    gFilter: theDoFilterGlobal,
                    filter: theDoFilter,
                    elementsPerLine,
                    opts
                }),
                filteredGroupedData = __getVirtualGroup({
                    dimensions,
                    gap,
                    grouping,
                    grouped: gData,
                    scrollTop,
                    elementsPerLine,
                    originalGroupedData,
                    opts
                }),
                newVirtual = __getVirtual({
                    filteredGroupedData,
                    elementsPerLine,
                    dimensions,
                    scrollTop
                });
            return {
                filteredGroupedData,
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
                originalGroupedData,
                globalFilter,
                warning
                // globalFilterValue
            } = oldState,
            opts = {trakTimes, warning, lib},

            params = {
                [LOADING]: {virtual},
                [TOGGLE_GROUP]: {payload, originalGroupedData},
                [FILTER]: {
                    payload, globalFilterValue, filters,
                    columns, filterFactory, dimensions,
                    grouping,  originalGroupedData, elementsPerLine, trakTimes,
                    virtual, theDoFilterGlobal,
                    globalFilter, opts
                },
                [UNFILTER_FIELDS]: {
                    payload, globalFilterValue, filters, columns,
                    trakTimes, dimensions, grouping,
                    originalGroupedData, elementsPerLine, virtual,
                    globalFilter, opts
                },
                [UNFILTER]: {
                    payload, globalFilterValue, filters, columns,
                    trakTimes, elementsPerLine, dimensions, originalGroupedData,
                    grouping, virtual,
                    globalFilter, opts
                },
                [SCROLL]: {
                    payload, dimensions, grouping,
                    globalFilterValue, originalGroupedData, theDoFilterGlobal, theDoFilter,
                    elementsPerLine, trakTimes, virtual, opts
                }
            }[type] || {};

        if (type in actions) {
            const newState = {
                ...oldState,
                ...actions[type](params)
            };

            return newState;
        }
        return oldState;
    },

    init = (cnf = {}) => {
        if ('gap' in cnf && cnf.gap < 0) doThrow({ message: 'The parameter `gap` cannot be negative', opts: { lib } });
        const trak = { start: +new Date },
            {
                trakTimes = false,
                data = [],
                gap = GAP,
                uie = UIE,
                Loader = DEFAULT_LOADER,
                dimensions: {
                    width = WIDTH,
                    height = HEIGHT,
                    itemHeight = ITEM_HEIGHT,
                    itemWidth = ITEM_WIDTH
                } = {},
                rvgID = RVG_ID,
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
                    collapsible: collapsibleGroups = false
                } = {},

                header: {
                    caption: {
                        Component: HeaderCaptionComponent = () => null,
                        height: headerCaptionHeight = 0
                    } = {}
                } = {},
                footer: {
                    caption: {
                        Component: FooterCaptionComponent = () => null,
                        height: footerCaptionHeight = 0
                    } = {}
                } = {},

                events: {
                    onItemEnter = null,
                    onItemLeave = null,
                    onItemClick = null,
                } = {},
                headers = {},
                globalPreFilter = '',
                NoFilterData = () => NO_FILTER_DATA_MESSAGE,
                cls: {
                    HeaderCaption: HeaderCaptionCls = null,
                    FooterCaption: FooterCaptionCls = null,
                } = {},
                Item,
                globalFilter = GLOBAL_FILTER,
                warning = WARNING
            } = cnf,
            /**
             * to know why read the comment in __getVirtualGroup */
            gapPlus = gap + 1,
            grouping = {
                groups,
                groupHeader: {
                    Component: GroupComponent,
                    height: groupComponentHeight
                },
                ungroupedLabel,
                collapsible : collapsibleGroups
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
            originalGroupedData = __getGrouped({
                data, elementsPerLine,
                groups: grouping.groups, opts: { ungroupedLabel, lib, trakTimes, warning },
                collapsible: collapsibleGroups
            }),
            // originalGroupedData0 = __getGrouped({data, groups, elementsPerLine, opts: {ungroupedLabel, lib, trak: true}}),            
            funcFilters = __composeFilters({ headers, opts: { trakTimes, lib } }),

            // columns, filterFactory and theDoFilter can stay static in the state
            columns = headers.map(h => h.key),
            filterFactory = __getFilterFactory({ columns, filters: funcFilters, opts: { trakTimes, lib, warning } }),
            theDoFilter = filterFactory(),

            // this needs to be recreated every time the global filter changes
            theDoFilterGlobal = filterFactory(globalPreFilter),

            {gData, filtered} = __applyFilter({
                globalValue: globalPreFilter,
                groupedData: originalGroupedData,
                gFilter: theDoFilterGlobal,
                filter: theDoFilter,
                elementsPerLine,
                opts: { trakTimes, lib }
            }),

            filteredGroupedData = __getVirtualGroup({
                dimensions,
                gap: gapPlus,
                grouping,
                grouped: gData,
                scrollTop: 0,
                elementsPerLine,
                originalGroupedData,
                opts: { trakTimes, lib }
            }),
            /**
             * 
             ****************************************************************************/


            innerVirtual = __getVirtual({
                filteredGroupedData,
                elementsPerLine,
                dimensions,
                scrollTop: 0
            }),
            virtual = {
                loading: false,
                gap: gapPlus,
                contentHeight: height - headerCaptionHeight - footerCaptionHeight,
                ...innerVirtual
            };
            

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
            // ...cnf,

            // somehow static
            data: data.map(item => ({ [rvgID]: `${uniqueID}`, ...item })),
            uie,
            rvgID,
            trakTimes,
            elementsPerLine,
            Loader,
            grouping,
            header: { caption: { Component: HeaderCaptionComponent, height: headerCaptionHeight}},
            footer: { caption: { Component: FooterCaptionComponent, height: footerCaptionHeight}},
            dimensions,
            debounceTimes: { scrolling, filtering, },
            events: { onItemEnter, onItemLeave, onItemClick,},
            cls: { HeaderCaptionCls, FooterCaptionCls},
            NoFilterData,
            originalGroupedData,
            gap: gapPlus,
            Item,
            globalFilter,
            warning,

            // dynamic
            headers,
            filtered,
            total: data.length,
            filteredGroupedData,
            theDoFilterGlobal,
            theDoFilter,
            filterFactory,
            columns,
            virtual,
            filters: funcFilters,
            globalFilterValue: globalPreFilter
        };
    };

export default () => ({
    reducer,
    init
});