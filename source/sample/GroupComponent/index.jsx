import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName,
    cls
}) => {
    const classes = useStyles();
    return (
        <div className={[classes.Group, cls].join(' ')}>{groupName}</div>
    );
};
export default GroupComponent;