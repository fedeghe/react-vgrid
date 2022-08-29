import { createUseStyles } from "react-jss";

export default createUseStyles({
    Item: {
        backgroundColor: '#eee',
        overflow:'scroll',
        border:'5px solid white',
        outline: '1px solid gray',
        borderRadius: 5,
        
        // comment-toggle both the following to get a margin
        height:'inherit',
        // margin:20
    },
    Inner:{
        padding:'10px',
        '& ul':{
            listStyleType: 'none',
            paddingLeft: '10px'
        }
    }
});