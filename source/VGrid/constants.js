import React from 'react';
// the name of the component
export const CMPNAME = 'react-vgrid',
    // how many lines extra viewport up and down before virtualization ? 
    GAP = 3,

    // grid sizes
    WIDTH = 1200,
    HEIGHT = 800,
    
    // grid item size
    ITEM_HEIGHT = 150,
    ITEM_WIDTH = 200,
    
    // group component height 
    GROUP_COMPONENT_HEIGHT = 20,

    // global filter
    GLOBAL_FILTER = ({rowField, globalFilterUserValue}) => `${rowField}`.includes(globalFilterUserValue),

    // id appended string
    RVG_ID = '_ID',

    // debouning values
    DEBOUNCE_SCROLLING = 50,
    DEBOUNCE_FILTERING = 50,

    DEFAULT_LOADER = () => (<div>loading</div>),

    // no data message
    NO_FILTER_DATA_MESSAGE = 'no data',

    // ungrouped group label
    UNGROUPED_LABEL = 'ungrouped',

    // unfilter families
    FILTERS = {
        ALL : 'ALL',
        GLOBAL : 'GLOBAL',
        FIELDS : 'FIELDS',
    },
    UIE = 'data-uie',

    // 0 none, 1 all
    WARNING = 0;
