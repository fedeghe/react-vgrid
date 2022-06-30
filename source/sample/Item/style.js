import { createUseStyles } from "react-jss";

export default createUseStyles({
    Item: {
        backgroundColor: '#eee',
        overflow:'scroll',
        height:'inherit',
        border:'5px solid white',
        outline: '1px solid gray',
        borderRadius: 5
    },
    Inner:{
        padding:'10px',
    }
});