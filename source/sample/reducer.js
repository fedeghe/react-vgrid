

export const ACTION_TYPES = {
    UPDATEFIELD: "UPDATEFIELD"
};

// eslint-disable-next-line one-var
const actions = {
        [ACTION_TYPES.UPDATEFIELD]: ({data, payload}) => {
            const {entityid, value} = payload,
                ret = {...data},
                index = data.findIndex(r =>r.entityid === entityid);
            ret[index].name = value;
            return ret;
        },
    },
    
    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            { data } = oldState,
            params = {
                [ACTION_TYPES.UPDATEFIELD]: {data, payload}
            }[type] || {};

        if (type in actions) {
            const newState = {
                ...oldState,
                ...actions[type](params)
            };
            return newState;
        }
        return oldState;
    },

    init = d => d;

export default () => ({
    reducer,
    init
});