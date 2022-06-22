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
    // __getFillerHeights = ({
    //     dimensions: {width, height, itemWidth, itemHeight},
    //     size
    // }) => {
    //     const horizNum = Math.floor(width / itemWidth),
    //         vertNum = Math.ceil(height / itemHeight),
    //         carpetHeight = vertNum * itemHeight;
    //     const topFillerHeight = 10,
    //         bottomFillerHeight = 300
    //     return {
    //         topFillerHeight,
    //         bottomFillerHeight
    //     };
    // },

    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                data
            } = oldState,

            actions = {};

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
                lineGap = 3,
                Loader = () => (<div>loading</div>),
                dimensions: {
                    width = 1200,
                    height = 800,
                    itemHeight = 150,
                    itemWidth = 200
                } = {},
                Item,
                rhgID = '_ID',
            } = cnf,
            dimensions = {
                width, height,
                itemHeight, itemWidth
            },
            rows = Math.floor(width / itemWidth),
            lines = Math.ceil((data.length * itemWidth) / width);
        return {
            ...cnf,
            rhgID,
            originalData : data,
            data : data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            Loader,
            dimensions,
            virtual: {
                loading: false,
                lines,
                rows,
                ...__getVirtual({dimensions, size: data.length, scrollTop: 0, lines, rows, lineGap}),
            }
        };
    };

export default () => ({
    reducer,
    init
});