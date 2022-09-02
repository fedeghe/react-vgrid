import React from 'react';
import { isFunction } from './utils';
import {
    __getFilterFactory,  __cleanFilters,
    __getVirtual, __getVirtualGroup,
    __getGrouped0, __getGrouped, __composeFilters,
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

const lib = CMPNAME,
     reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                dimensions,
                originalData,
                filteredData,
                filteredGroupedData,
                virtual,
                virtual: {
                    lineGap,
                    scrollTop
                },
                globalFilterValue,
                filters,

                columns,
                theDoFilter,
                filterFactory,
                theDoFilterGlobal,

                grouping,
                trakTimes,
                elementsPerLine,
                originalGroupedData
                // globalFilterValue
            } = oldState,

            actions = {

                
                loading: () => ({
                    virtual: {
                        ...virtual,
                        loading: true
                    }
                }),


                filter: () => {
                    const { value, field } = payload,
                        // must start from everything
                        base = [...originalData],
                        isGlobalSearch = !field,
                        ret = {};
                    let _newData = base,
                        _globalFilterValue = globalFilterValue,
                        _newFilters = {...filters};

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
                    const doFilter = __getFilterFactory({columns, filters: _newFilters});
                        
                    // global ? 
                    if (isGlobalSearch || _globalFilterValue) {
                        if(isGlobalSearch) {
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
                    const newVirtual = __getVirtual({
                            dimensions,
                            size: _newData.length,
                            scrollTop,
                            lineGap,
                            grouping
                        }),
                        { fromItem, toItem } = newVirtual,


                    /**
                     * GROUPED
                     */
                     filteredGroupedData = __applyFilter({
                        globalValue: _globalFilterValue,
                        groupedData: originalGroupedData,
                        gFilter: ret.theDoFilterGlobal,
                        filter: theDoFilter,
                        elementsPerLine,
                        opts: {trakTimes, lib}
                    });


                    console.log('filter new : ',
                        __getVirtualGroup({
                            dimensions,
                            lineGap,
                            grouping,
                            grouped: filteredGroupedData,
                            scrollTop,
                            elementsPerLine,
                            opts: {trakTimes, lib}
                        })
                    );

                    return {
                        ...ret,
                        data: _newData.slice(fromItem, toItem),
                        filters: _newFilters,
                        filteredData: _newData,
                        filtered: _newData.length,
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


                unFilterFields: () => {
                    let _globalFilterValue = globalFilterValue,
                        _newFilters = {...filters},
                        _filteredData = [...originalData];

                    const filteringFields = payload.filter(f => columns.includes(f));
                    
                    filteringFields.forEach(f => {_newFilters[f].value = '';});
                    
                    // eslint-disable-next-line one-var
                    const doFilter = __getFilterFactory({
                        columns,
                        filters: _newFilters
                    });

                    _filteredData = _filteredData.filter(doFilter());

                    if (_globalFilterValue) {
                        _filteredData = _filteredData.filter(doFilter(_globalFilterValue));
                    }
                    
                    // eslint-disable-next-line one-var
                    const newVirtual = __getVirtual({
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
                        filtered: _filteredData.length
                    };
                },

                
                unFilter: () => {                    
                    let _globalFilterValue = globalFilterValue,
                        _newFilters = {...filters},
                        _filteredData = [...originalData];

                    const doFilter = __getFilterFactory ({columns, filters: _newFilters});
                            
                    switch (payload) {
                        case FILTERS.ALL:
                            _globalFilterValue = '';
                            _newFilters = __cleanFilters(filters);
                            break;
                        case FILTERS.GLOBAL:
                            _globalFilterValue = '';
                            _filteredData = _filteredData.filter(doFilter());
                            break;
                        case FILTERS.FIELDS:
                            _newFilters = __cleanFilters(filters);
                            _filteredData = _filteredData.filter(doFilter(_globalFilterValue));
                            break;
                    }

                    // eslint-disable-next-line one-var
                    const newVirtual = __getVirtual({
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
                        filtered: _filteredData.length
                    };

                },


                scroll: () => {
                    const scrollTop = parseInt(payload, 10),
                        newVirtual = __getVirtual({
                            dimensions,
                            size: filteredData.length,
                            scrollTop,
                            lineGap,
                            grouping
                        }),
                        { fromItem, toItem } = newVirtual;


                    /**
                     * 
                     */
                    // eslint-disable-next-line one-var
                    const gData = __applyFilter({
                        globalValue: globalFilterValue,
                        groupedData: filteredGroupedData,
                        gFilter: theDoFilterGlobal,
                        filter: theDoFilter,
                        elementsPerLine,
                        opts: {trakTimes, lib}
                    });
                    console.log('new on scroll : ',{scrollTop},
                        __getVirtualGroup({
                            dimensions,
                            lineGap,
                            grouping,
                            grouped: gData,
                            scrollTop,
                            elementsPerLine,
                            opts: {trakTimes, lib}
                        })
                    );
                    /**
                     * 
                     */

                    return {
                        data: filteredData.slice(fromItem, toItem),
                        virtual: {
                            ...virtual,
                            ...newVirtual,
                        }
                    };
                }
            };

        if (type in actions)
            return {
                ...oldState,
                ...actions[type]()
            };
        return oldState;
    },
    init = (cnf = {}) => {
        const trak = {start: +new Date},
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
                        height : groupComponentHeight = GROUP_COMPONENT_HEIGHT
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
            lineGapPlus = lineGap +1,
            grouping= {
                groups,
                groupHeader: {
                    Component: GroupComponent,
                    height : groupComponentHeight
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

            // *************************************************************************
            /**
             * starting from specified groups, separate the data and create the groups
             */
            originalGroupedData = __getGrouped({data, groups, elementsPerLine, opts: {ungroupedLabel, lib, trakTimes}}),
            // originalGroupedData0 = __getGrouped({data, groups, elementsPerLine, opts: {ungroupedLabel, lib, trak: true}}),            
            funcFilters = __composeFilters({headers, opts: {trakTimes, lib}}),

            // columns, filterFactory and theDoFilter can stay static in the state
            columns = headers.map(h => h.key),
            filterFactory = __getFilterFactory({columns, filters: funcFilters, opts: {trakTimes, lib}}),
            theDoFilter = filterFactory(),
            
            // this needs to be recreated every time the global filter changes
            theDoFilterGlobal = filterFactory(globalPreFilter),

            gData = __applyFilter({
                globalValue: globalPreFilter,
                groupedData: originalGroupedData,
                gFilter: theDoFilterGlobal,
                filter: theDoFilter,
                elementsPerLine,
                opts: {trakTimes, lib}
            }),
            // *************************************************************************

            
            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),

            innerVirtual = __getVirtual({
                dimensions,
                size: originalData.length,
                lineGap: lineGapPlus,
                grouping,
                grouped: gData,
                scrollTop: 0
            }),

            virtual = {
                loading: false,
                lineGap: lineGapPlus,
                ...innerVirtual
            },
            { fromItem, toItem } = innerVirtual,
            
            initialData = (
                globalPreFilter
                ? originalData.filter(theDoFilterGlobal)
                : originalData
            ).filter(theDoFilter);
        
        if (lineGapPlus < 1) doThrow({message: 'The parameter `lineGap` cannot be negative',opts:{lib}});

        console.log('new : ',
            __getVirtualGroup({
                dimensions,
                lineGap: lineGapPlus,
                grouping,
                grouped: gData,
                scrollTop: 0,
                elementsPerLine,
                opts: {trakTimes, lib}
            })
        );
        
        // console.log('originalGroupedData', originalGroupedData);
        // console.log('originalGroupedData0', originalGroupedData0)

        // console.log(originalGroupedData);
        // console.log(initialGroupedData);
        // what about order?
        /**/for (var g in originalGroupedData) {
        /**/    console.log(g, originalGroupedData[g].entries.length);
        /**/}
        // every group must have a grouper
        /**/if (groups.length && groups.some(group => typeof group.grouper !== 'function')) {
        /**/    throw 'Every defined group must have a grouper function';
        /**/}
        /////////////////////////////////////////////////////////////////////
        if (trakTimes) {
            trak.end = +new Date;
            trakTime({
                what: 'reducer initialization',
                time: trak.end - trak.start,
                opts: {trakTimes, lib}}
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
            data: initialData.slice(fromItem, toItem),
            filtered: initialData.length,
            total: originalData.length,

            //grouped
            originalGroupedData,
            filteredGroupedData: {...gData},
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