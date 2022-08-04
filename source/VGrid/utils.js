const isFunction = f => typeof f === 'function',
    debounce = (func, wait) => {
        let timeout,
            enabled = true;
        return (...params) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (!enabled) return;
                func(...params);
                enabled = false;
                setTimeout(() => enabled = true, wait);
            }, wait);
        };
    },
    escapeComma = r => `${r}`.replace(/,/g, '\\,'),
    removeID = (jsonData, rhgID) => jsonData.map(row => {
        var r = {...row};
        delete r[rhgID];
        return r;
    }),
    asXsv = (columns, jsonData, rhgID, separator) => {
        const lines = [],
            keys = columns.map(c => c.key);
        lines.push(keys.join(separator));
        removeID(jsonData, rhgID).forEach(row => {
            lines.push(keys.map(k => escapeComma(row[k])).join(separator));
        });
        return lines.join("\n");
    },
    asJson = removeID;

export {
    isFunction,
    debounce,
    asXsv,
    asJson
};
