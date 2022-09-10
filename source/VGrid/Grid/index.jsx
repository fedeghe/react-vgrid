import React, { useCallback, useContext, useEffect, useRef } from 'react';
import NoData from './NoData';
import Filler from './Filler';
import {FILTERS} from './../constants';

import GridContext from './../Context';
import { debounce, asXsv, asJson } from './../utils';
import useStyles from './style.js';
import { ACTION_TYPES } from '../reducer';

const Grid = () => {
    const ref = useRef(),
        { state, dispatch } = useContext(GridContext),
        {
            filteredData,
            total,
            dimensions: {
                height, width,
                itemHeight, itemWidth
            },
            Item,
            virtual: {
                dataHeight,
                carpetHeight,
                contentHeight,
                scrollTop,
                loading,
                renderedItems,
                cardinality
            },
            debounceTimes: {
                scrolling: scrollingDebounceTime,
                filtering: filteringDebounceTime,
            },
            header: { HeaderCaptionComponent, headerCaptionHeight },
            footer: { FooterCaptionComponent, footerCaptionHeight },
            rhgID,
            events: {onItemEnter, onItemLeave, onItemClick },
            globalFilterValue,
            filtered,
            filters,
            columns,
            cls: { HeaderCaptionCls, FooterCaptionCls },
            filteredGroupedData: {
                allocation: { alloc, topFillerHeight, bottomFillerHeight }
            },
            grouping: {
                groupHeader : {
                    height: groupHeaderHeight,
                    Component: GroupHeaderComponent
                }
            }
        } = state,

        classes = useStyles({
            width, height,
            itemHeight, itemWidth,
            headerCaptionHeight,
            footerCaptionHeight,
        }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        globalFilter = useCallback(
            debounce(
                ({value, field}) => dispatch({
                    type: ACTION_TYPES.FILTER,
                    payload: {value, field}
                }),
                filteringDebounceTime
            ),[]
        ),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        doOnScroll = useCallback(
            debounce(
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const payload = e.target.scrollTop;
                    dispatch({
                        type: ACTION_TYPES.SCROLL,
                        payload: payload > 0 ? payload : 0
                    });
                },
                scrollingDebounceTime
            ), []
        ),

        onScroll = useCallback(e => {
            Math.abs(e.target.scrollTop - scrollTop) > (dataHeight / 4) && dispatch({
                type: ACTION_TYPES.LOADING
            });
            doOnScroll(e);
        }, [dataHeight, dispatch, doOnScroll, scrollTop]),

        getHandlers = useCallback(item => {
            const handlers = {};
            onItemEnter && (handlers.onMouseEnter = e => onItemEnter.call(e, e, {item}));
            onItemLeave && (handlers.onMouseLeave = e => onItemLeave.call(e, e, {item}));
            onItemClick && (handlers.onClick = e => onItemClick.call(e, e, {item}));
            return handlers;
        }, [onItemClick, onItemEnter, onItemLeave]),

        resetFilters = useCallback((what = FILTERS.ALL) => {
            let actionType = null;
            if (Array.isArray(what) && what.every(w => columns.includes(w))) { // is array and all in fields
                actionType = ACTION_TYPES.UNFILTER_FIELDS;
            } else if (what in FILTERS) {
                actionType = ACTION_TYPES.UNFILTER;
            }
            actionType && dispatch({
                type: actionType,
                payload: what
            });
        }, [dispatch, columns]),

        filterDataFields = useCallback(({fields}) => 
            fields
            ? filteredData.map(e => fields.reduce(
                (acc, f) => {
                    f in e && (acc[f] = e[f]);
                    return acc;
                }, {})
            )
            : filteredData
        , [filteredData]),

        downloadJson = useCallback(({fields} = {}) => {
            const a = document.createElement('a'),
                d = filterDataFields({fields}),
                blob = new Blob([JSON.stringify(asJson(d, rhgID))]);
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = 'extract.json';                     //filename to download
            a.click();
        }, [filterDataFields, rhgID]),

        downloadXsv = useCallback(({separator = ',', fields} = {}) => {
            const a = document.createElement('a'),
                d = filterDataFields({fields}),
                xsv = asXsv((fields || columns).map(f => ({key: f})) , d, rhgID, separator),
                blob = new Blob([xsv], { type: 'text/csv' });
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = 'extract.csv';                     //filename to download
            a.click();
        }, [columns, filterDataFields, rhgID]),

        captionProps = {
            globalFilter, 
            globalFilterValue,
            filtered,
            loading,
            renderedItems,
            total,
            cardinality,
            filters,
            resetFilters,
            downloadJson,
            downloadXsv,
            dataHeight,
            carpetHeight,
            contentHeight,
        };

    useEffect(() => {
        ref && ref.current
        && scrollTop === 0 && ref.current.scrollTo(0, 0);
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
            {Object.entries(alloc).map(
                ([label, renderables]) => renderables.map(renderable => {
                    if (!renderable.renders) return null;
                    return renderable.header
                        ? <GroupHeaderComponent key={label} groupName={label} groupHeaderHeight={groupHeaderHeight}/>
                        : renderable.rows.map((row, i) =>
                            <div key={`${row[rhgID]}_${i}`} className={classes.Item}
                                {...getHandlers(row)}
                            >
                                <Item {...row}/>
                            </div>
                        );
                })
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