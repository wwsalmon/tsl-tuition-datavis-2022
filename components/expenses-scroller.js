import getColor from "../utils/getColor.js";

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
import {allData, schoolLabels} from "../utils/data.js";

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
}).sort((a, b) => b.expenses - a.expenses);

console.log(expData);

const width = 960;
const height = 540;

const pl = 48;
const pr = 48;
const pb = 48;
const pt = 48;
const graphWidth = width - pl - pr;
const graphHeight = height - pt - pb;

const yScale = d3.scaleLinear().domain([0, d3.max(expData.map(d => d.expenses))]).range([graphHeight, 0]);
const xScale = d3.scaleBand().range([0, graphWidth]).domain(expData.map(d => d.school)).padding(0.2);
const bandwidth = xScale.bandwidth();

const splitData = expData.map(d => {
    const startHeight = yScale(d.expenses);
    const barHeight = graphHeight - startHeight;
    const numShortSide = Math.round(Math.sqrt(d.enrollment / (barHeight / bandwidth)));
    return {
        startHeight,
        school: d.school,
        barHeight,
        squareSide: bandwidth / numShortSide,
        numShortSide,
        numLongSide: Math.round(numShortSide * barHeight / bandwidth),
    };
});

function initialize(svg) {
    const container = svg.append("g").style("transform", `translate(${pl}px, ${pt}px)`).attr("id", "container");

    const barGroups = container
        .selectAll("g.barGroups")
        .data(splitData)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .style("transform", d => `translate(${xScale(d.school)}px, ${d.startHeight}px)`);

    barGroups
        .append("rect")
        .attr("class", "singleRect")
        .attr("width", d => d.squareSide)
        .attr("height", d => d.squareSide)
        .attr("fill", d => getColor(schoolLabels[d.school]));

    barGroups
        .append("rect")
        .attr("class", "mainRect")
        .attr("width", bandwidth)
        .attr("height", d => d.barHeight)
        .attr("fill", d => getColor(schoolLabels[d.school]));

    barGroups
        .selectAll("path.splitLineY")
        .data(d => Array(d.numShortSide).fill(d.squareSide))
        .enter()
        .append("path")
        .attr("class", "splitLineY splitLine")
        .attr("d", (d,i) => d3.line()([[i * d, 0], [i * d, height]]));

    barGroups
        .selectAll("path.splitLineX")
        .data(d => Array(d.numLongSide).fill(d.squareSide))
        .enter()
        .append("path")
        .attr("class", "splitLineX splitLine")
        .attr("d", (d,i) => d3.line()([[0, i * d], [bandwidth, i * d]]));

    container
        .selectAll(".splitLine")
        .attr("stroke", "white")
        .attr("strokeWidth", 1)
        .style("opacity", 0);

    container.append("g").attr("class", "xAxis").call(d3.axisBottom(xScale).tickSize(0)).style("transform", `translateY(${graphHeight}px)`);
}

function step2From1(svg) {
    console.log("2 from 1");

    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    console.log(container, barGroups);

    // split lines in (t1)
    container.selectAll(".splitLine")
        .transition()
        .duration(750)
        .style("opacity", 1);

    // axes out (t1)
    container.selectAll(".xAxis")
        .transition()
        .duration(750)
        .style("opacity", 0);

    // barGroups align top (t1)
    barGroups
        .data(splitData)
        .join("g")
        .transition()
        .duration(750)
        .style("transform", d => `translate(${xScale(d.school)}px, 0px)`);

    // main rects out (t2)
    container.selectAll(".mainRect")
        .transition()
        .delay(750)
        .duration(750)
        .style("opacity", 0);

    // split lines out (t2)
    container.selectAll(".splitLine")
        .transition()
        .delay(750)
        .duration(750)
        .style("opacity", 0);

    // single rects big (t3)
    container.selectAll(".singleRect")
        .transition()
        .delay(1500)
        .duration(750)
        .style("transform", "scale(24)");
}

function step1From2(svg) {
    console.log("1 from 2");

    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    // single rects small (t1)
    container.selectAll(".singleRect")
        .transition()
        .duration(750)
        .style("transform", "scale(1)");

    // split lines in (t2)
    container.selectAll(".splitLine")
        .transition()
        .delay(750)
        .duration(750)
        .style("opacity", 1);

    // main rects in (t2)
    container.selectAll(".mainRect")
        .transition()
        .delay(750)
        .duration(750)
        .style("opacity", 1);

    // barGroups to position (t3)
    barGroups
        .data(splitData)
        .join("g")
        .transition()
        .delay(1500)
        .duration(750)
        .style("transform", d => `translate(${xScale(d.school)}px, ${d.startHeight}px)`);

    // axes in (t3)
    container.selectAll(".xAxis")
        .transition()
        .delay(1500)
        .duration(750)
        .style("opacity", 1);

    // split lines out (t3)
    container.selectAll(".splitLine")
        .transition()
        .delay(1500)
        .duration(750)
        .style("opacity", 0);
}


class ExpensesScroller extends D3Component {
    initialize(node, props) {
        const {step} = props;

        const svg = (this.svg = d3.select(node).append("svg"));

        svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "100vh");

        initialize(svg);
    }

    update(props, oldProps) {
        const {step} = props;

        if (step === 0) return step1From2(this.svg);
        if (step === 1) return step2From1(this.svg);
    }
}

module.exports = ExpensesScroller;
