import { isFunction } from './utils';
let count = 0;
const prefix = 'HYG_',
    uniqueID = {
        toString: () => {
            count += 1;
            return prefix + count;
        }
    },

    reducer = (oldState, action) => {
        const { payload = {}, type } = action,
            {
                data
            } = oldState,

            actions = {};

        if (type in actions)
            return {
                ...oldState,
                ...actions[type]()
            };
        return oldState;
    },
    init = (cnf = {}) => {
        const {
            data = [],
            Loader = () => null,
            dimensions: {
                width = 1200,
                height = 800,
                itemHeight = 150,
                itemWidth = 200
            } = {},
            Item,
            rhgID = '_ID',
        } = cnf;

        return {
            data : data.map(item => ({ [rhgID]: `${uniqueID}`, ...item })),
            Loader,
            Item, 
            dimensions: {
                width, height,
                itemHeight, itemWidth
            },
            rhgID
        };
    };

export default () => ({
    reducer,
    init
});