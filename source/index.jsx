import React from 'react';

import { createRoot } from 'react-dom/client';

import Sample from './sample/sample1';
// import Sample from './sample/sample2';

import 'web-page-monitor';

if(location.host.match(/^localhost/)) {
    WebPageMonitor
        .showNET()
        .showFPS()
        .showMEM({
            height: 30,
        })
        .showTAGS({
            frequency: 10,
        })
        .showEVENTS({
            frequency: 10,
            exclude: [
                'onmousemove',
            ]
        })
        .render({collapsible: true});
}

const container = document.getElementById('root'),
    root = createRoot(container);
root.render(<Sample/>);