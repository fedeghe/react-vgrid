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
    __getVirtual = ({scrollTop, dimensions, size, lineGap}) => {
        const {height, itemHeight, width, itemWidth} = dimensions,
            columns = Math.floor(width / itemWidth),
            lines = Math.ceil(size / columns),
            carpetHeight = lines * itemHeight,
            trigger = scrollTop > (lineGap+1) * itemHeight,

            topLinesSkipped = Math.max(0, Math.floor(scrollTop / itemHeight) - lineGap),
            topFillerHeight = topLinesSkipped * itemHeight,
            linesToRender = 2 * lineGap + Math.ceil(height / itemHeight),
            dataHeight = linesToRender * itemHeight,
            maxRenderedItems = columns * linesToRender,
            bottomFillerHeight = Math.max(carpetHeight - topFillerHeight - dataHeight, 0), 
            fromItem = trigger
                ? topLinesSkipped * columns
                : 0,
            toItem = trigger ? fromItem + maxRenderedItems: linesToRender * columns;
        return {
            fromItem,
            toItem,
            carpetHeight,
            topFillerHeight,
            bottomFillerHeight,
            linesToRender,
            dataHeight,
            maxRenderedItems,
            loading:false,
            lines,
            columns,
            scrollTop,
            rendered: toItem - fromItem
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
                filters,
                fields,
                // globalFilterValue
            } = oldState,
            actions = {
                loading: () => ({
                    virtual : {
                        ...virtual,
                        loading: true
                    }
                }),
                filter : () => {
                    const {value, field} = payload;
                    
                    // filtering for a specific field value ? 
                    if (field && field in filters){
                        
                        const fData = originalData.filter(row => filters[field].filter({
                                userValue: `${value}`,
                                row
                            })),
                            newVirtual = __getVirtual({dimensions, size: fData.length, scrollTop, lineGap}),
                            {fromItem, toItem} = newVirtual;

                        return {
                            filters: {
                                ...filters,
                                [field] : {
                                    ...filters[field],
                                    value
                                }
                            },
                            data: fData.slice(fromItem, toItem),
                            filteredData: fData,
                            filtered: fData.length,
                            virtual: {
                                ...virtual,
                                ...newVirtual,
                                rendered: Math.min(toItem - fromItem, fData.length),
                                scrollTop: 0
                            }
                        };
                    }
                    
                    // unfielded filter,
                    // use field filter if exists, or the raw value
                    else {
                        const _filteredData = originalData.filter(row => row.key in filters
                                ? filters[row.key]({userValue: value, row})
                                : fields.some(field => `${row[field]}`.includes(value))
                            ),
                            newVirtual = __getVirtual({dimensions, size: _filteredData.length, scrollTop, lineGap}),
                            {fromItem, toItem} = newVirtual;
                        return {
                            filteredData: _filteredData,
                            filtered: _filteredData.length,
                            data: _filteredData.slice(fromItem, toItem),
                            globalFilterValue: value,
                            virtual: {
                                ...virtual,
                                ...newVirtual,
                                rendered: Math.min(newVirtual.toItem - newVirtual.fromItem, _filteredData.length),
                                scrollTop: 0
                            }
                        };
                    }
                },

                unfilter: () => {
                    const newVirtual = __getVirtual({
                        dimensions,
                        size: originalData.length,
                        scrollTop, lineGap
                    }),
                    {fromItem, toItem} = newVirtual;
                    return {
                        filteredData: originalData,
                        data: originalData.slice(fromItem, toItem),
                        globalFilterValue: '',
                        virtual: {
                            ...virtual,
                            ...newVirtual,
                            rendered: Math.min(toItem - fromItem +1, originalData.length)
                        },
                        filtered: originalData.length
                    };
                },
                scroll: () => {
                    const scrollTop = parseInt(payload, 10),
                        newVirtual = __getVirtual({dimensions, size: filteredData.length, scrollTop, lineGap}),
                        {fromItem, toItem} = newVirtual;

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
                    HeaderCaption : HeaderCaptionCls= null,
                    FooterCaption : FooterCaptionCls= null,
                } = {}
            } = cnf,
            dimensions = {
                width,
                height,
                itemHeight, itemWidth
            },
            
            originalData = data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            innerVirtual = __getVirtual({dimensions, size: originalData.length, scrollTop: 0, lineGap}),
            virtual = {
                loading: false,
                lineGap,
                ...innerVirtual
            },
            {fromItem, toItem} = innerVirtual,
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
        console.log(funcFilters)
        
        return {
            ...cnf,
            rhgID,
            originalData : originalData,
            filteredData : [...originalData],
            filtered: originalData.length,
            data : originalData.slice(fromItem, toItem),
            total: originalData.length,
            fields,
            Loader,
            header : {
                HeaderCaptionComponent,
                headerCaptionHeight
            },
            footer : {
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
            cls:{
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