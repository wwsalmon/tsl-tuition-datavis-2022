import React from "react";
import D3Component from "idyll-d3-component";
import * as d3 from "d3";
import {allData} from "../utils/data.js";

const expData = Object.keys(allData).map(d => {
    const thisData = allData[d].find(x => x.year === 2020);
    const thisDataExpKeys = Object.keys(thisData).filter(x => x.substring(0, 3) === "exp");
    const expenses = thisDataExpKeys.reduce((a, b) => a + thisData[b], 0);
    const enrollment = thisData.enrollment;
    const expensesPerStudent = expenses / enrollment;
    return ({
        school: d,
        enrollment,
        expenses,
        expensesPerStudent,
    });
});

const width = 1920;
const height = 1080;

class ExpensesScroller extends D3Component {
    initialize(node, props) {
        const svg = (this.svg = d3.select(node).append("svg"));
        svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "100vh");
    }

    update(props, oldProps) {
    }
}

module.exports = ExpensesScroller;
