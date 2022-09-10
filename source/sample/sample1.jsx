import React from 'react';
import VGrid from '../VGrid';
import config from '../configSmall';
// import config from '../../tests/configs/basic';
import './user.css';

const Page = () => (
    <>
        <p>something in the way</p>
        <VGrid config={config} />
    </>
);

export default Page;