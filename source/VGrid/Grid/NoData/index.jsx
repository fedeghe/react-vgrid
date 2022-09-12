import React, { useContext } from 'react';
import TableContext from '../../Context';

import useStyles from './style.js';
const NoData = () => {
    const {
            state: {
                NoFilterData,
                dimensions: { width, height },
                total,
                header: {
                    caption: {
                        height : headerCaptionHeight
                    }
                },
                footer: {
                    caption: {
                        height: footerCaptionHeight
                    }
                }
            }
        } = useContext(TableContext),
        classes = useStyles({width, height: height - headerCaptionHeight - footerCaptionHeight});
    
    return <div className={classes.NoData}><NoFilterData total={total} /></div>;
};

export default NoData;