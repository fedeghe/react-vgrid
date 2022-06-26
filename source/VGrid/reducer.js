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
            itemsToRender = columns * linesToRender,
            bottomFillerHeight = Math.max(carpetHeight - topFillerHeight - dataHeight, 0), 
            fromItem = trigger
                ? topLinesSkipped * columns
                : 0,
            toItem = trigger ? fromItem + itemsToRender: linesToRender * columns;
        return {
            fromItem,
            toItem,
            carpetHeight,
            topFillerHeight,
            bottomFillerHeight,
            linesToRender,
            dataHeight,
            loading:false,
            lines,
            columns,
            scrollTop
        };
    },

    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                dimensions,
                originalData,
                virtual,
                virtual: {
                    lineGap
                }
            } = oldState,
            actions = {
                loading: () => ({
                    virtual : {
                        ...virtual,
                        loading: true
                    }
                }),
                filter : () => {

                },
                scroll: () => {
                    const scrollTop = parseInt(payload, 10),
                        newVirtual = __getVirtual({dimensions, size: originalData.length, scrollTop, lineGap}),
                        {fromItem, toItem} = newVirtual;

                    return {
                        data: originalData.slice(fromItem, toItem),
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
                    scrolling = 50
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
            {fromItem, toItem} = innerVirtual;
            
        
        return {
            ...cnf,
            rhgID,
            originalData : originalData,
            data : originalData.slice(fromItem, toItem),
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
                scrolling
            },
            events: {
                onItemEnter,
                onItemLeave,
                onItemClick,
            },
            // filters: [],
            // globalFilter: ''
        };
    };

export default () => ({
    reducer,
    init
});