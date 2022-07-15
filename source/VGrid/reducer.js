import React from 'react';
import { isFunction } from './utils';
import { __getDoFilter,  __cleanFilters, __getVirtual, uniqueID} from './reducerUtils';

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
                fields,
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
                    const doFilter = __getDoFilter({fields, filters: _newFilters});
                        
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

                    const filteringFields = payload.filter(f => fields.includes(f));
                    
                    filteringFields.forEach(f => {_newFilters[f].value = '';});
                    
                    // eslint-disable-next-line one-var
                    const doFilter = __getDoFilter({
                        fields,
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

                    const doFilter = __getDoFilter ({fields, filters: _newFilters});
                            
                    switch (payload) {
                        case '_ALL_':
                            _globalFilterValue = '';
                            _newFilters = __cleanFilters(filters);
                            break;
                        case '_GLOBAL_':
                            _globalFilterValue = '';
                            _filteredData = _filteredData.filter(doFilter());
                            break;
                        case '_FIELDS_':
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
                lineGap = 2,
                Loader = () => (<div>loading</div>),
                dimensions: {
                    width = 1200,
                    height = 800,
                    itemHeight = 150,
                    itemWidth = 200
                } = {},
                rhgID = '_ID',
                debounceTimes: {
                    scrolling = 50,
                    filtering = 50,
                } = {},

                grouping: {
                    groups = [],
                    group: {
                        Component: GroupComponent = n => n,
                        height : groupComponentHeight = 20
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
                NoFilterData = () => 'no data',
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
            tmpGroupFlags = Array.from({length: data.length}, () => true),
            groupedData = groups.reduce((acc, {label, grouper}, k) => {
                if (k < groups.length -1) {
                    acc[label] = data.filter((row, i) => {
                        if (grouper && grouper(row)) {
                            tmpGroupFlags[i] = false;
                            return true;
                        }
                        return false;
                    });
                } else {
                    acc[label] = data.filter((row, i) =>    tmpGroupFlags[i]);
                }
                return acc;
            }, {}),


            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            innerVirtual = __getVirtual({
                dimensions,
                size: originalData.length,
                lineGap,
                grouping
            }),
            virtual = {
                loading: false,
                lineGap,
                ...innerVirtual
            },
            { fromItem, toItem } = innerVirtual,
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
            fields = headers.map(h => h.key),
            doFilter = __getDoFilter({fields, filters: funcFilters}),
            initialData = (
                globalPreFilter
                ? originalData.filter(doFilter(globalPreFilter))
                : originalData
            ).filter(doFilter());
        
        console.log(groupedData);
        // one group shouldn't have a grouper
        if (groups.length && groups.every(group => typeof group.grouper === 'function')) {
            throw 'No default group found (at least one group should only have a label)';
        }

        return {
            ...cnf,
            rhgID,
            
            originalData: originalData,
            filteredData: [...initialData],
            data: initialData.slice(fromItem, toItem),
            
            filtered: initialData.length,
            total: originalData.length,
            fields,
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