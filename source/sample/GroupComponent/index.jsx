import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName
}) => {
    const classes = useStyles();
    return (
        <div className={classes.Group}>{groupName}</div>
    );
};
export default GroupComponent;