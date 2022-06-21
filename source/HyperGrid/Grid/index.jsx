import React, { useCallback, useContext, useRef, useEffect } from 'react';
import NoData from './NoData';


import GridContext from './../Context';
import { debounce } from './../utils';
import useStyles from './style.js';

export default () => {
    const ref = useRef(),
        { state, dispatch } = useContext(GridContext),
        {
            data,
            dimensions: {
                height, width,
                itemHeight, itemWidth
            },
            Item,
            rhgID
        } = state,
        classes = useStyles({
            width, height,
            itemHeight, itemWidth
        });

    return <div className={classes.GridContainer}>
        {data.map( item =>
            <div key={data[rhgID]} className={classes.Item}>
                <Item {...item}/>
            </div>
        )}
    </div>;
        
};

