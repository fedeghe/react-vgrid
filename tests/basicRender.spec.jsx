
/**
 * @jest-environment jsdom
 */
import React from "react";
import {
    render,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { configure } from "@testing-library/dom";

import VGrid from "../source/VGrid";
import { UNGROUPED_LABEL } from "../source/VGrid/constants";
import config from "./configs/basic";

configure({
    testIdAttribute: "data-uie",
});

describe("VGrid - basic", () => {
    it("should render as expected", () => {
        const { container, getByTestId, queryByTestId } = render(
                <VGrid config={config} />
            ),
            {dimensions, gap} = config,
            {height, width, itemHeight, itemWidth} = dimensions,
            elementsPerLine = Math.floor(width / itemWidth),
            inViewPort = Math.round(height / itemHeight), // rem 50% cutoff
            // rem gap is always 1+
            topRender = (inViewPort + gap) * elementsPerLine;

        let i = 0;
        for(null; i < topRender; i++)
            expect(getByTestId(`item-${UNGROUPED_LABEL}-${i}`));
        expect(container).toMatchSnapshot();

        // top + 1 th should fail
        expect(queryByTestId(`item-${UNGROUPED_LABEL}-${i}`)).toBeNull();
        
    });
});
