import React from 'react';

import useStyles from './style.js';

const Item = data => {
    const classes = useStyles();
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            {data.id}
        </div>
    </div>;
};
export default Item;