import React, { useContext, useMemo } from 'react';
import SampleContext from '../Context';
import { ACTION_TYPES } from '../reducer';

import useStyles from './style.js';

const Item = ({row}) => {
    const classes = useStyles(),
        {state, dispatch} = useContext(SampleContext),
        {name, index} = useMemo(() => {
            const i = state.data.findIndex(r => r.entityid === row.entityid);
            return {
                name: state.data[i].name,
                index: i
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [row.name]);
        
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
                        value={name}
                        onChange={e => dispatch({
                            type: ACTION_TYPES.UPDATEFIELD,
                            payload: {
                                value: e.target.value,
                                index,
                            }
                        })}
                    />
                </li>
            </ul>
        </div>
    </div>;
};
export default Item;