import React, { useCallback, useContext, useRef, useEffect } from 'react';
import NoData from './NoData';
import Filler from './Filler';


import GridContext from './../Context';
import { debounce } from './../utils';
import useStyles from './style.js';

const Grid = () => {
    const { state, dispatch } = useContext(GridContext),
        {
            data,
            dimensions: {
                height, width,
                itemHeight, itemWidth
            },
            Item,
            virtual: {
                topFillerHeight,
                bottomFillerHeight,
                dataHeight,
                scrollTop
            },
            debounceTimes: {
                scrolling: scrollingDebounceTime
            },
            rhgID
        } = state,
        classes = useStyles({
            width, height,
            itemHeight, itemWidth
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        doOnScroll = useCallback(debounce(e => {
            e.preventDefault();
            e.stopPropagation();
            const payload = e.target.scrollTop;
            dispatch({
                type: 'scroll',
                payload: payload > 0 ? payload : 0
            });
        }, scrollingDebounceTime), []),

        onScroll = useCallback(e => {
            Math.abs(e.target.scrollTop - scrollTop) > (dataHeight / 4)
                && dispatch({ type: 'loading' });
            doOnScroll(e);
        }, [dataHeight, dispatch, doOnScroll, scrollTop]);

    return <div className={classes.GridContainer} onScroll={onScroll}>
        <Filler width="100%" height={topFillerHeight}/>
        {data.map( item => 
            <div key={item[rhgID]} className={classes.Item}>
                <Item {...item}/>
            </div>
        )}
        <Filler width="100%" height={bottomFillerHeight}/>
    </div>;
        
};

export default Grid;