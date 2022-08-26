import React from 'react';
import { isFunction } from './utils';
import {
    __getFilterFactory,  __cleanFilters,
    __getVirtual, __getVirtualGroup,
    __getGrouped, __getGrouped2, __composeFilters,
    __applyFilter,
    uniqueID, trakTime
} from './reducerUtils';
import {
    CMPNAME, LINE_GAP, WIDTH, HEIGHT, ITEM_HEIGHT, ITEM_WIDTH,
    RHG_ID, DEBOUNCE_SCROLLING, DEBOUNCE_FILTERING,
    NO_FILTER_DATA_MESSAGE, GROUP_COMPONENT_HEIGHT,
    UNGROUPED, FILTERS
} from './constants';

const reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                dimensions,
                originalData,
                filteredData,
                virtual,
                virtual: {
                    lineGap,
                    scrollTop
                },
                globalFilterValue,
                filters,
                columns,
                grouping,
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
                        { fromItem, toItem } = newVirtual;
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
                        }
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
                    group: {
                        Component: GroupComponent = n => n,
                        height : groupComponentHeight = GROUP_COMPONENT_HEIGHT
                    } = {},
                    ungroupedLabel = UNGROUPED
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

            grouping= {
                groups,
                group: {
                    Component: GroupComponent,
                    height : groupComponentHeight
                }
            },

            dimensions = {
                width,
                height,
                itemHeight, itemWidth
            },
            elementsPerLine = Math.floor(width / itemWidth),

            /**
             * starting from specified groups, separate the data and create the groups
             */
            originalGroupedData = __getGrouped2({data, groups, elementsPerLine, opts: {ungroupedLabel, lib: CMPNAME, trakTimes}}),
            // originalGroupedData0 = __getGrouped({data, groups, elementsPerLine, opts: {ungroupedLabel, lib: CMPNAME, trak: true}}),


            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),

            funcFilters = __composeFilters({headers, opts: {trakTimes}}),
            columns = headers.map(h => h.key),

            filterFactory = __getFilterFactory({columns, filters: funcFilters, opts: {trakTimes}}),

            theDoFilterGlobal = filterFactory(globalPreFilter),
            theDoFilter = filterFactory(),


            gData = __applyFilter({
                globalValue: globalPreFilter,
                groupedData: originalGroupedData,
                gFilter: theDoFilterGlobal,
                filter: theDoFilter,
                elementsPerLine,
                opts: {trakTimes}
            }),

            innerVirtual = __getVirtual({
                dimensions,
                size: originalData.length,
                lineGap,
                grouping,
                grouped: gData,
                scrollTop: 0
            }),

            virtual = {
                loading: false,
                lineGap,
                ...innerVirtual
            },
            { fromItem, toItem } = innerVirtual,
            
            
            initialData = (
                globalPreFilter
                ? originalData.filter(theDoFilterGlobal)
                : originalData
            ).filter(theDoFilter);
        
            
        console.log('new : ',
            __getVirtualGroup({
                dimensions,
                lineGap,
                grouping,
                grouped: gData,
                scrollTop: 0,
                opts: {trakTimes}
            })
        );
        
// console.log('originalGroupedData', originalGroupedData);
// console.log('originalGroupedData0', originalGroupedData0)

        /*

        :::===== :::  === :::===== :::===== :::  ===      :::====  :::====  ::: :::= === :::====
        :::      :::  === :::      :::      ::: ===       :::  === :::  === ::: :::===== :::====
        ===      ======== ======   ===      ======        =======  ===  === === ========   ===
        ===      ===  === ===      ===      === ===       ===      ===  === === === ====   ===
         ======= ===  === ========  ======= ===  ===      ===       ======  === ===  ===   ===
        
        */
        // 
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
            trakTime({what: 'reducer initialization', time: trak.end - trak.start})
        }
        return {
            ...cnf,
            rhgID,

            
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