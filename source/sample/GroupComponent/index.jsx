import React from 'react';
import useStyles from './style';

const GroupComponent = ({
    groupName,
    groupHeaderHeight,
    toggleGroup = () => {},
    collapsible,
    collapsed,
    dataUieName,
    dataUieValue,
}) => {
    const classes = useStyles({groupHeaderHeight});
    
    return (
        <div onClick={toggleGroup} className={classes.Group} {...{[dataUieName]: dataUieValue}}>
            {groupName}
            {collapsible ? ' - ' + (collapsed ? 'expand': 'collapse') : ''}
        </div>
    );
};
export default GroupComponent;