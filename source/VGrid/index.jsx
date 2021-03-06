import React, { useReducer } from 'react';

import GridContext from './Context';
import reducerFactory from './reducer';
import Grid from './Grid';

import useStyles from './style.js';

export default ({config}) => {
    const { reducer, init } = reducerFactory(),
        [ state, dispatch ] = useReducer(reducer, config, init),
        {
            dimensions: {
                width, height
            },
            Loader,
            virtual: {loading}
        } = state,
        classes = useStyles({
            width, height,
        });
    
    return <div className={[classes.Wrapper, 'Wrapper'].join(' ')}>
        <GridContext.Provider value={{state, dispatch}}>
            {loading && <div className={classes.LoaderContainer}><Loader/></div>}
            <Grid/>
        </GridContext.Provider>
    </div>;
};

