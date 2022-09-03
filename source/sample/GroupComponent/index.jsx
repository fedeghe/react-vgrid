import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName,
    groupHeaderHeight
}) => {
    const classes = useStyles({groupHeaderHeight});
    return (
        <div className={classes.Group}>{groupName}</div>
    );
};
export default GroupComponent;