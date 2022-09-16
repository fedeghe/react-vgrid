import { createUseStyles } from "react-jss";

export default createUseStyles({
    Item: {
        backgroundColor: '#fff',
        overflow:'scroll',
        border:'5px solid ###ddd',
        outline: '1px solid red',
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