import React from 'react';
import useStyles from './style.js';

const Item = row => {
    const classes = useStyles();
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            <ul>
                {Object.keys(row).filter(k => k !=='_ID').map((fk, i) => (
                    <li key={`k_${i}`}>
                        <b>{fk}</b> : {row[fk]}
                    </li>
                ))}
            </ul>
        </div>
    </div>;
};
export default Item;