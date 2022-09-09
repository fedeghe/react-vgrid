let count = 0;
const prefix = 'RVG_',
    isFunction = f => typeof f === 'function',
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
    asJson = removeID,
    trakTime = ({ what, time, opts }) =>
        console.info(`%c${opts.lib.toUpperCase()} 🐢 ${what} spent ${time}ms`, 'color:DodgerBlue'),
    doWarn = ({ message, opts }) =>
        console.warn(`${opts.lib.toUpperCase()} 🙉 ${message}`),
    doThrow = ({ message, opts }) => {
        throw `${opts.lib.toUpperCase()} 🚨 ${message}`;
    },
    throwIf = ({ condition, message, opts }) => {
        if (condition) {
            throw `${opts.lib.toUpperCase()} 🚨 ${message}`;
        }
    },
    uniqueID = {
        toString: () => {
            count += 1;
            return prefix + count;
        }
    };
    

export {
    isFunction,
    debounce,
    asXsv,
    asJson,
    trakTime, doWarn, doThrow, throwIf, uniqueID
};
