import React from 'react';
import { isFunction } from './utils';
import {
    __getDoFilter,  __cleanFilters, __getVirtual,
    uniqueID
} from './reducerUtils';
import {
    CMP, LINE_GAP, WIDTH, HEIGHT, ITEM_HEIGHT, ITEM_WIDTH,
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
                    const doFilter = __getDoFilter({columns, filters: _newFilters});
                        
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
                    const doFilter = __getDoFilter({
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

                    const doFilter = __getDoFilter ({columns, filters: _newFilters});
                            
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
        const {
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
                    } = {}
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

            // use a flag array so to be able afterward to 
            // recognise and filter in the default group
            // all rows that dont belong to any group
            tmpGroupFlags = Array.from({length: data.length}, () => true),

            
            /**
             * starting from specified groups, separate the data and create the groups
             */
            originalGroupedData = (() => {
                const g = groups.reduce((acc, {label, grouper}) => {
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
                g[UNGROUPED] = data.filter((row, i) => tmpGroupFlags[i]);
                if (groups.length && g[UNGROUPED].length) {
                    console.warn(`[${CMP.toUpperCase()} warning]: ${g[UNGROUPED].length} elements are ungrouped`);
                }
                return g;
            })(),
            
            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),

            groupNames = Object.keys(originalGroupedData),
            funcFilters = headers.reduce((acc, header) => {
                if (isFunction(header.filter)) {
                    acc[header.key] = {
                        filter: header.filter,
                        value: header.preFiltered || ''
                    };
                } else {
                    acc[header.key] = {
                        filter: () => true,
                        value: ''
                    };
                }
                return acc;
            }, {}),
            columns = headers.map(h => h.key),
            getFilter = __getDoFilter({columns, filters: funcFilters}),

            theDoFilter = getFilter(),
            theDoFilterGlobal = getFilter(globalPreFilter),

            initialGroupedDataGobalFiltered = globalPreFilter
                ? groupNames.reduce((acc, groupName) => {
                    acc[groupName] = originalGroupedData[groupName].filter(theDoFilterGlobal);
                    return acc;
                }, {})
                : originalGroupedData,

            initialGroupedData = groupNames.reduce((acc, groupName) => {
                acc[groupName] = initialGroupedDataGobalFiltered[groupName].filter(theDoFilter);
                return acc;
            }, {}),

            innerVirtual = __getVirtual({
                dimensions,
                size: originalData.length,
                lineGap,
                grouping,
                grouped: initialGroupedData
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
            ).filter(theDoFilter  );
        
        // check 
        // console.log(originalGroupedData);
        // console.log(initialGroupedData);


        // what about order?
        for (var g in originalGroupedData) {
            console.log(g, originalGroupedData[g].length);
        }

        // every group must have a grouper
        if (groups.length && groups.some(group => typeof group.grouper !== 'function')) {
            throw 'Every defined group must have a grouper function';
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
            filteredGroupedData: {...initialGroupedData},


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