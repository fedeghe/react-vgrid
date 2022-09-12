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
            // data,
            total,
            dimensions: {
                height, width,
                itemHeight, itemWidth,
                contentHeight
            },
            Item,
            virtual: {
                dataHeight,
                carpetHeight,
                scrollTop,
                loading,
                
            },
            debounceTimes: {
                scrolling: scrollingDebounceTime,
                filtering: filteringDebounceTime,
            },
            header: { caption: { Component: HeaderCaptionComponent, height: headerCaptionHeight }},
            footer: { caption: { Component: FooterCaptionComponent, height: footerCaptionHeight }},
            rvgID,
            events: {onItemEnter, onItemLeave, onItemClick },
            globalFilterValue,
            originalGroupedData,
            filtered,
            filters,
            columns,
            cls: { HeaderCaptionCls, FooterCaptionCls },
            filteredGroupedData: {
                allocation: {
                    alloc,
                    topFillerHeight,
                    bottomFillerHeight,
                    renderedHeaders,
                    renderedItems
                }
            },
            grouping: {
                groupHeader : {
                    height: groupHeaderHeight,
                    Component: GroupHeaderComponent
                },
                collapsible,
                groups,
            },
            elementsPerLine,
            uie
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

        toggleGroup = useCallback(({label}) => {
            dispatch({type: ACTION_TYPES.TOGGLE_GROUP, payload: label});
        }, [dispatch]),
        getItemUie = useCallback((i, j) => (uie ? {[uie]: `item-${i}-${j}`} : {}), [uie]),
        getHeaderUieValue = useCallback(label => (uie ? `header-${label}`: ''), [uie]),
        getGroupComponentProps = useCallback(({label}) => {
            const groupProps = {
                key: label,
                groupName: label,
                groupHeaderHeight,
                dataUieName: uie,
                dataUieValue: getHeaderUieValue(label)
            };
            if (collapsible) {
                groupProps.collapsible = true;
                groupProps.collapsed = originalGroupedData[label].collapsed;
                groupProps.toggleGroup=()=>toggleGroup({label});
            }
            return groupProps;
        }, [collapsible, getHeaderUieValue, groupHeaderHeight, originalGroupedData, toggleGroup, uie]),

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

        // no more data
        // filterDataFields = useCallback(({fields}) => 
        //     fields
        //     ? data.map(e => fields.reduce(
        //         (acc, f) => {
        //             f in e && (acc[f] = e[f]);
        //             return acc;
        //         }, {})
        //     )
        //     : data
        // , [data]),
        // 
        // but alloc
        // maybe a better way should be seeked
        filterDataFields = useCallback(({ fields } = {}) => 
             Object.values(alloc).reduce((acc, groupArr) => 
                 acc.concat(
                    groupArr.reduce((iAcc, line) => 
                        'rows' in line
                        ? iAcc.concat(
                            line.rows.map(row =>
                                fields
                                ? fields.reduce((iiAcc, f) => {
                                    if (f in row) iiAcc[f] = row[f];
                                    return iiAcc;
                                }, {})
                                : row
                            )
                        )
                        : iAcc
                    , [])
                )
            , [])
        , [alloc]),

        downloadJson = useCallback(({fields} = {}) => {
            const a = document.createElement('a'),
                d = filterDataFields({fields}),
                blob = new Blob([JSON.stringify(asJson(d, rvgID))]);
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = 'extract.json';                     //filename to download
            a.click();
        }, [filterDataFields, rvgID]),

        downloadXsv = useCallback(({separator = ',', fields} = {}) => {
            const a = document.createElement('a'),
                d = filterDataFields({fields}),
                xsv = asXsv((fields || columns).map(f => ({key: f})) , d, rvgID, separator),
                blob = new Blob([xsv], { type: 'text/csv' });
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = 'extract.csv';                     //filename to download
            a.click();
        }, [columns, filterDataFields, rvgID]),

        captionProps = {
            globalFilter, 
            globalFilterValue,
            filtered,
            loading,
            renderedHeaders,
            renderedItems,
            total,
            filters,
            resetFilters,
            downloadJson,
            downloadXsv,
            dataHeight,
            carpetHeight,
            contentHeight,
        },
        headerCaptionMoreProps = uie ? {uie: 'headerCaption'} : {},
        footerCaptionMoreProps = uie ? {uie: 'footerCaption'} : {};

    useEffect(() => {
        if (
            ref && ref.current
            && scrollTop === 0
            && ref.current.scrollTo
        ) ref.current.scrollTo(0, 0);
    }, [scrollTop, ref]);   


    return <div>
        {Boolean(headerCaptionHeight) && (
            <div className={[classes.HeaderCaption, HeaderCaptionCls].join(' ')}>
                <HeaderCaptionComponent {...captionProps} {...headerCaptionMoreProps}/>
            </div>
        )}
        {filtered ? (
        <div className={classes.GridContainer} ref={ref} onScroll={onScroll}>
            <Filler width="100%" height={topFillerHeight} />
            {Object.entries(alloc).map(
                ([label, renderables]) => renderables.map((renderable, j) => {
                    if (!renderable.renders) return null;

                    
                    return renderable.header
                        ? <GroupHeaderComponent {...getGroupComponentProps({label})}/>
                        : renderable.rows.map((row, i) =>
                            <div key={`${row[rvgID]}_${i}`} className={classes.Item}
                                {...getHandlers(row)}
                                {...getItemUie(label, j*elementsPerLine + i)}
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
                <FooterCaptionComponent {...captionProps} {...footerCaptionMoreProps}/>
            </div>
        )}
    </div>;

};

export default Grid;