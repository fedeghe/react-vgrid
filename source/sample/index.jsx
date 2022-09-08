import React, {useReducer} from 'react';
import VGrid from '../VGrid';
import config from '../configSmall';
import reducerFactory from './reducer';
import './user.css';

const reducer = reducerFactory(),
    Pg = () => {
        const [state, dispatch] = useReducer(reducer.func, config, reducer.init),
            { data } = state;

        return <VGrid config={data} />;
    };

export default Pg;