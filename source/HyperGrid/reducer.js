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
    __getVirtual = ({dimensions, size, scrollTop, lines, rows, lineGap}) => {
        
        const {height, itemHeight} = dimensions,
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
            dataHeight
        };
    },

    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                dimensions,
                virtual,
                virtual: {
                    lines, rows,
                    lineGap
                }
            } = oldState,

            actions = {
                scroll: () => {
                    const scrollTop = parseInt(payload, 10),
                        newVirtual = __getVirtual({dimensions, scrollTop, lines, rows, lineGap});

                    return {
                        virtual: {
                            ...virtual,
                            ...newVirtual
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
            } = cnf,
            dimensions = {
                width, height,
                itemHeight, itemWidth
            },
            rows = Math.floor(width / itemWidth),
            lines = Math.ceil((data.length * itemWidth) / width),
            virtual = {
                loading: false,
                lines,
                rows,
                lineGap,
                ...__getVirtual({dimensions, size: data.length, scrollTop: 0, lines, rows, lineGap}),
            };
            
        
        return {
            ...cnf,
            rhgID,
            originalData : [...data],
            data : data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            Loader,
            dimensions,
            virtual
        };
    };

export default () => ({
    reducer,
    init
});