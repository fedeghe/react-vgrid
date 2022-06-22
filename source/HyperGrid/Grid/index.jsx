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
                fromItem, toItem
            },
            rhgID
        } = state,
        classes = useStyles({
            width, height,
            itemHeight, itemWidth
        }),
        onScroll = useCallback(e => {
            const payload = e.target.scrollTop;
            dispatch({
                type: 'scroll',
                payload: payload > 0 ? payload : 0
            });
        }, [dispatch]);
    
    

    return <div className={classes.GridContainer} onScroll={onScroll}>
        <Filler width="100%" height={topFillerHeight}/>
        {data.slice(fromItem, toItem + 1).map( item => 
            <div key={item[rhgID]} className={classes.Item}>
                <Item {...item}/>
            </div>
        )}
        <Filler width="100%" height={bottomFillerHeight}/>
    </div>;
        
};

export default Grid;