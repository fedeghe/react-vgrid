import React from 'react';
import useStyles from './style.js';

const Filler = ({
    width,
    height
}) => {
    const classes = useStyles({width, height});
    return <div className={classes.Filler}>&nbsp;</div>;
};

export default Filler;
