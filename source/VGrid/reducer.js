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
    __getVirtual = ({dimensions, size, scrollTop, lineGap}) => {
        
        const {height, itemHeight, width, itemWidth} = dimensions,
            rows = Math.floor(width / itemWidth),
            lines = Math.ceil((size * itemWidth) / width),
            carpetHeight = lines * itemHeight,
            trigger = scrollTop > lineGap * itemHeight,

            topLinesSkipped = Math.max(0, Math.floor(scrollTop / itemHeight) - lineGap),
            topFillerHeight = topLinesSkipped * itemHeight,
            linesToRender = 2 * lineGap + Math.ceil(height / itemHeight),
            dataHeight = linesToRender * itemHeight,
            itemsToRender = rows * linesToRender,
            bottomFillerHeight = carpetHeight - topFillerHeight - dataHeight,
            fromItem = trigger
                ? topLinesSkipped * rows
                : 0;

        return {
            fromItem,
            toItem: trigger ? fromItem + itemsToRender: linesToRender * rows,
            carpetHeight,
            topFillerHeight,
            bottomFillerHeight,
            linesToRender,
            dataHeight,
            loading:false,
            lines,
            rows
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
                    ...virtual,
                    loading: true
                }),
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
        console.log('init')
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
                    scrolling = 10
                } = {}
            } = cnf,
            dimensions = {
                width, height,
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
            dimensions,
            virtual,
            debounceTimes: {
                scrolling
            }
        };
    };

export default () => ({
    reducer,
    init
});