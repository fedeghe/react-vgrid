import React from 'react';

import useStyles from './style.js';

const Item = data => {
    const classes = useStyles();
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            <ul>
                {Object.keys(data).map((fk, i) => (
                    <li key={`k_${i}`}>
                        {fk} : {data[fk]}
                    </li>
                ))}
            </ul>
        </div>
    </div>;
};
export default Item;