import React from 'react';

import useStyles from './style.js';

export default data => {
    const classes = useStyles();
    return <div className={classes.Item}>
        <div className={classes.Inner}>
            {data.id}
        </div>
    </div>;
};
