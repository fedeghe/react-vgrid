import { createUseStyles } from "react-jss";

export default createUseStyles({
    Line: {
        display:'flex',
        justifyContent:'space-between',
        alignItems: 'center',
        padding:'10px',
        lineHeight:'1em'
    },
    HeaderCaption: {
        backgroundColor: 'rgb(20, 93, 130)',
        lineHeight: '45px',
        '& input': {
            height: '25px'
        }
    },
});