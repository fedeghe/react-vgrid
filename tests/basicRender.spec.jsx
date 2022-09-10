
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
        );
        let i = 0;    
        for(null; i < 20; i++)
            expect(getByTestId(`item-${UNGROUPED_LABEL}-${i}`))
        expect(container).toMatchSnapshot();

        // 20 should fail
        expect(queryByTestId(`item-${UNGROUPED_LABEL}-${i}`)).toBeNull()
    });
});
