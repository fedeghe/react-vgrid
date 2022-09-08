import React, { useContext, useMemo } from 'react';
import SampleContext from '../Context';
import { ACTION_TYPES } from '../reducer';

import useStyles from './style.js';

const Item = data => {
    const classes = useStyles(),
        {state, dispatch} = useContext(SampleContext),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        value = useMemo(() => state.data.find(
            r => r.id === data.id
        ).name, [data.name, data]);
        
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            <ul>
                {Object.keys(data).filter(k => k !=='_ID').map((fk, i) => (
                    <li key={`k_${i}`}>
                        <b>{fk}</b> : {data[fk]}
                    </li>
                ))}
                <li>
                    <input
                        type="text"
                        value={value}
                        onChange={e => dispatch({
                            type: ACTION_TYPES.UPDATEFIELD,
                            payload: {
                                id: data.id,
                                value: e.target.value
                            }
                        })}
                    />
                </li>
            </ul>
        </div>
    </div>;
};
export default Item;