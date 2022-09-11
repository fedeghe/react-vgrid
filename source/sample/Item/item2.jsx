import React, { useContext, useMemo } from 'react';
import SampleContext from '../Context';
import { ACTION_TYPES } from '../reducer';

import useStyles from './style.js';

const Item = row => {
    const classes = useStyles(),
        {state, dispatch} = useContext(SampleContext),
        value = useMemo(() => state.data.find(
            r => r.entityid === row.entityid
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ).name, [row.name]);
        
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            <ul>
                {Object.keys(row).filter(k => k !=='_ID').map((fk, i) => (
                    <li key={`k_${i}`}>
                        <b>{fk}</b> : {row[fk]}
                    </li>
                ))}
                <li>
                    <input
                        type="text"
                        value={value}
                        onChange={e => dispatch({
                            type: ACTION_TYPES.UPDATEFIELD,
                            payload: {
                                entityid: row.entityid,
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