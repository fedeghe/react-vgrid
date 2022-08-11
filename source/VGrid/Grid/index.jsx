import React, { useCallback, useContext, useEffect, useRef } from 'react';
import NoData from './NoData';
import Filler from './Filler';


import GridContext from './../Context';
import { debounce } from './../utils';
import useStyles from './style.js';

const Grid = () => {
    const ref = useRef(),
        { state, dispatch } = useContext(GridContext),
        {
            data,
            dimensions: {
                height, width,
                itemHeight, itemWidth
            },
            Item,
            virtual: {
                topFillerHeight,
                bottomFillerHeight,
                dataHeight,
                scrollTop,
                loading,
                fromItem, toItem,
                maxRenderedItems,
            },
            debounceTimes: {
                scrolling: scrollingDebounceTime,
                filtering: filteringDebounceTime,
            },
            header: {
                HeaderCaptionComponent,
                headerCaptionHeight
            },
            footer: {
                FooterCaptionComponent,
                footerCaptionHeight
            },
            rhgID,
            events: {
                onItemEnter,
                onItemLeave,
                onItemClick,
            },
            globalFilterValue,
            filtered,
            filters,
            fields,
            cls: {
                HeaderCaptionCls,
                FooterCaptionCls
            }
        } = state,
        classes = useStyles({
            width, height,
            itemHeight, itemWidth,
            headerCaptionHeight,
            footerCaptionHeight,
        }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        globalFilter = useCallback(debounce(({value, field}) => {
            dispatch({
                type: 'filter',
                payload: {value, field}
            });
        }, filteringDebounceTime), []),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        doOnScroll = useCallback(debounce(e => {
            e.preventDefault();
            e.stopPropagation();
            const payload = e.target.scrollTop;
            dispatch({
                type: 'scroll',
                payload: payload > 0 ? payload : 0
            });
        }, scrollingDebounceTime), []),

        onScroll = useCallback(e => {
            if (Math.abs(e.target.scrollTop - scrollTop) > (dataHeight / 4)) {

                dispatch({ type: 'loading' });
            }
            doOnScroll(e);
        }, [dataHeight, dispatch, doOnScroll, scrollTop]),

        getHandlers = useCallback(item => {
            const handlers = {};
            if(onItemEnter) {
                handlers.onMouseEnter = e => {
                    onItemEnter.call(e, e, {item});
                    dispatch({
                        type: 'itemEnter',
                        payload: {item}
                    });
                };
            }
            if (onItemLeave){
                handlers.onMouseLeave = e => {
                    onItemLeave.call(e, e, {item});
                    dispatch({
                        type: 'itemLeave',
                        payload: {item}
                    });
                };
            }
            if (onItemClick) {
                handlers.onClick = e => onItemClick.call(e, e, {item});
            }
            return handlers;
        }, [dispatch, onItemClick, onItemEnter, onItemLeave]),

        resetFilters = useCallback((what = '_ALL_') => {
            let actionType = null;
            if (Array.isArray(what) && what.every(w => fields.includes(w))) { // is array and all in fields
                actionType = 'unFilterFields';
            } else if (what.match(/_ALL_|_GLOBAL_|_FIELDS_/)) {
                actionType = 'unFilter';
            }
            actionType && dispatch({
                type: actionType,
                payload: what
            });
        }, [dispatch, fields]),

        captionProps = {
            globalFilter, 
            globalFilterValue,
            filtered,
            loading,
            maxRenderedItems,
            filters,
            resetFilters,
            fromItem, toItem
        };

    useEffect(() => {
        if (ref && ref.current && scrollTop === 0) {
            // ref.current.scrollTo(ref.current.scrollLeft, 0);
            ref.current.scrollTop = 0;
        }
    }, [scrollTop, ref]);    

    return <div>
        {Boolean(headerCaptionHeight) && (
            <div className={[classes.HeaderCaption, HeaderCaptionCls].join(' ')}>
                <HeaderCaptionComponent {...captionProps}/>
            </div>
        )}
        {filtered ? (
        <div className={classes.GridContainer} ref={ref} onScroll={onScroll}>
            <Filler width="100%" height={topFillerHeight} />
            {data.map(item =>
                <div key={item[rhgID]} className={classes.Item}
                    {...getHandlers(item)}
                >
                    <Item {...item}/>
                </div>
            )}
            <Filler width="100%" height={bottomFillerHeight} />
        </div>) : <NoData/>}
        {Boolean(footerCaptionHeight) && (
            <div className={[classes.FooterCaption, FooterCaptionCls].join(' ')}>
                <FooterCaptionComponent {...captionProps}/>
            </div>
        )}
    </div>;

};

export default Grid;