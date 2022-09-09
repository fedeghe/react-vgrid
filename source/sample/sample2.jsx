import React, {useReducer} from 'react';
import VGrid from '../VGrid';
import config from '../configSmall';
import reducerFactory from './reducer';
import SampleContext from './Context';
import './user.css';

import Item2 from './Item/item2';
config.Item = Item2;

const reducer = reducerFactory(),
    Page = () => {
        const [state, dispatch] = useReducer(reducer.reducer, config, reducer.init);
        return (
            <SampleContext.Provider value={{state, dispatch}}>
                <VGrid config={config} />
            </SampleContext.Provider>
        );

    };

export default Page;