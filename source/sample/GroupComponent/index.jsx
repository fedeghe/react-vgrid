import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName,
    groupHeaderHeight,
    ...rest
}) => {
    const classes = useStyles({groupHeaderHeight});
    return (
        <div className={classes.Group} {...rest}>{groupName}</div>
    );
};
export default GroupComponent;