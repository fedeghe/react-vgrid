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
        <div className={classes.Group} {...{[dataUieName]: dataUieValue}}>
            {groupName}
            {Boolean(collapsible) && <span className={classes.Coll}onClick={toggleGroup}>{collapsed ? '▼': '▲'}</span>}
        </div>
    );
};
export default GroupComponent;