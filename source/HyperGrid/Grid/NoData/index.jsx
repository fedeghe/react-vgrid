import React, { useContext } from 'react';
import TableContext from '../../Context';

import useStyles from './style.js';
export default () => {
    const {
            state: {
                NoFilterData,
                dimensions: { width },
                total,
                virtual: {
                    colspan,
                    contentHeight: height
                }
            }
        } = useContext(TableContext),
        classes = useStyles({width, height});

    return <NoFilterData total={total} />;
};
