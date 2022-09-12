import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName,
    groupHeaderHeight,
    toggleGroup,
    collapsible,
    ...rest
}) => {
    const classes = useStyles({groupHeaderHeight});
    return (
        <div onClick={toggleGroup} className={classes.Group} {...rest}>{groupName}</div>
    );
};
export default GroupComponent;