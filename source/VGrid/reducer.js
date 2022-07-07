import React from 'react';
import { isFunction } from './utils';
let count = 0;
const prefix = 'HYG_',
    uniqueID = {
        toString: () => {
            count += 1;
            return prefix + count;
        }
    },
    __cleanFilters = _filters => Object.keys(_filters).reduce((acc, k) => {
        acc[k] = {
            filter: _filters[k].filter,
            value: ''
        };
        return acc;
    }, {}),
    __getVirtual = ({ scrollTop, dimensions, size, lineGap }) => {
        const { height, itemHeight, width, itemWidth } = dimensions,
            columns = Math.floor(width / itemWidth),
            lines = Math.ceil(size / columns),
            carpetHeight = lines * itemHeight,
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

    reducer = (oldState, action) => {
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
                    const {funcFilteredFields, valueFilteredFields} = fields.reduce((acc, f) => {
                            acc[(f in _newFilters)? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
                            return acc;
                        }, {funcFilteredFields: [], valueFilteredFields: []}),
                        doFilter = v => row => 
                            funcFilteredFields[v ? 'some' : 'every'](fk => 
                                _newFilters[fk].filter({
                                    userValue: v || _newFilters[fk].value,
                                    row
                                })
                            )
                            ||
                            valueFilteredFields.some(f => `${row[f]}`.includes(v));
                        
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
                    const newVirtual = __getVirtual({ dimensions, size: _newData.length, scrollTop, lineGap }),
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
                    

                    // eslint-disable-next-line one-var
                    const filteringFields = payload.filter(f => fields.includes(f));

                    let _globalFilterValue = globalFilterValue,
                        _newFilters = {...filters},
                        _filteredData = [...originalData];
                    
                    filteringFields.forEach(f => {_newFilters[f].value = '';});
                    
                    // eslint-disable-next-line one-var
                    const {funcFilteredFields, valueFilteredFields} = fields.reduce((acc, f) => {
                            acc[(f in _newFilters)? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
                            return acc;
                        }, {funcFilteredFields: [], valueFilteredFields: []}),
                        doFilter = v => row => 
                            funcFilteredFields[v ? 'some' : 'every'](fk => 
                                _newFilters[fk].filter({
                                    userValue: v || _newFilters[fk].value,
                                    row
                                })
                            )
                            ||
                            valueFilteredFields.some(f => `${row[f]}`.includes(v));

                    _filteredData = _filteredData.filter(doFilter());

                    if (_globalFilterValue) {
                        _filteredData = _filteredData.filter(doFilter(_globalFilterValue));
                    }
                    
                    // eslint-disable-next-line one-var
                    const newVirtual = __getVirtual({
                            dimensions,
                            size: _filteredData.length,
                            scrollTop, lineGap
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

                        // eslint-disable-next-line one-var
                        const {funcFilteredFields, valueFilteredFields} = fields.reduce((acc, f) => {
                            acc[(f in _newFilters)? 'funcFilteredFields' : 'valueFilteredFields'].push(f);
                            return acc;
                        }, {funcFilteredFields: [], valueFilteredFields: []}),
                        doFilter = v => row => 
                            funcFilteredFields[v ? 'some' : 'every'](fk => 
                                _newFilters[fk].filter({
                                    userValue: v || _newFilters[fk].value,
                                    row
                                })
                            )
                            ||
                            valueFilteredFields.some(f => `${row[f]}`.includes(v));

                            
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
                            scrollTop, lineGap
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
                        newVirtual = __getVirtual({ dimensions, size: filteredData.length, scrollTop, lineGap }),
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
            headerCaption: {
                Component: HeaderCaptionComponent = null,
                height: headerCaptionHeight = 0
            } = {},
            footerCaption: {
                Component: FooterCaptionComponent = null,
                height: footerCaptionHeight = 0
            } = {},
            events: {
                onItemEnter,
                onItemLeave,
                onItemClick,
            } = {},
            filters = {},
            NoFilterData = () => 'no data',
            cls: {
                HeaderCaption: HeaderCaptionCls = null,
                FooterCaption: FooterCaptionCls = null,
            } = {}
        } = cnf,
            dimensions = {
                width,
                height,
                itemHeight, itemWidth
            },

            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            innerVirtual = __getVirtual({ dimensions, size: originalData.length, scrollTop: 0, lineGap }),
            virtual = {
                loading: false,
                lineGap,
                ...innerVirtual
            },
            { fromItem, toItem } = innerVirtual,
            funcFilters = Object.keys(filters).reduce((acc, filterKey) => {
                if (isFunction(filters[filterKey])) {
                    acc[filterKey] = {
                        filter: filters[filterKey],
                        value: ''
                    };
                }
                return acc;
            }, {}),
            fields = Object.keys(data[0]);

        return {
            ...cnf,
            rhgID,
            originalData: originalData,
            filteredData: [...originalData],
            filtered: originalData.length,
            data: originalData.slice(fromItem, toItem),
            total: originalData.length,
            fields,
            Loader,
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
            globalFilterValue: '',
            cls: {
                HeaderCaptionCls,
                FooterCaptionCls
            },
            NoFilterData
            // filters: [],
            // globalFilter: ''
        };
    };

export default () => ({
    reducer,
    init
});