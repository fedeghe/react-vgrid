import { createUseStyles } from "react-jss";

export default createUseStyles({
    Container: {
        display:'flex',
        justifyContent:'space-between',
        alignItems: 'center',
    },

    'FooterCaption': {
        backgroundColor: 'rgb(112, 182, 201)',
        paddingLeft: '2px',
        lineHeight: '25px'
    }
});