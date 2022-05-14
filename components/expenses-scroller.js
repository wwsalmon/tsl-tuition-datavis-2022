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
const squareScale = 24;

const animDuration = 500;

const yScale = d3.scaleLinear().domain([0, d3.max(expData.map(d => d.expenses))]).range([graphHeight, 0]);
const xScale = d3.scaleBand().range([0, graphWidth]).domain(expData.map(d => d.school)).padding(0.2);
const bandwidth = xScale.bandwidth();

const splitData = expData.map(d => {
    const startHeight = yScale(d.expenses);
    const barHeight = graphHeight - startHeight;
    const numShortSide = Math.round(Math.sqrt(d.enrollment / (barHeight / bandwidth)));
    return {
        expenses: d.expenses,
        expensesPerStudent: d.expensesPerStudent,
        startHeight,
        school: d.school,
        barHeight,
        squareSide: bandwidth / numShortSide,
        numShortSide,
        numLongSide: Math.round(numShortSide * barHeight / bandwidth),
    };
});

function fade(container, selector, delayCount = 0, fadeIn = false) {
    container.selectAll(selector)
        .transition()
        .delay(delayCount * animDuration)
        .duration(animDuration)
        .style("opacity", +fadeIn);
}

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
        .append("text")
        .attr("class", "rectLabel")
        .attr("dx", 8)
        .attr("dy", 8)
        .text(d => d3.format("$,")(d.expenses))
        .attr("fill", "white")
        .attr("dominant-baseline", "hanging")
        .style("font-size", 12)
        .style("font-weight", 600);

    const squareLabels = barGroups
        .append("text")
        .attr("class", "squareLabel")
        .attr("dx", 8)
        .attr("dy", 8)
        .attr("fill", "white")
        .attr("dominant-baseline", "hanging")
        .style("font-size", 12)
        .style("opacity", 0);

    squareLabels
        .append("tspan")
        .text(d => d3.format("$,")(Math.round(d.expensesPerStudent)))
        .style("font-weight", 600);

    squareLabels
        .append("tspan")
        .text("/student");

    barGroups
        .append("text")
        .attr("class", "squareLabel")
        .text(d => schoolLabels[d.school])
        .attr("dx", 8)
        .attr("dy", d => d.squareSide * squareScale - 8)
        .attr("fill", "white")
        .style("font-size", 8)
        .style("opacity", 0);

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

    container.append("g").attr("class", "xAxis").call(d3.axisBottom(xScale).tickSize(0).tickFormat(d => schoolLabels[d])).style("transform", `translateY(${graphHeight}px)`);

    svg
        .append("text")
        .attr("id", "title")
        .text("2019-20 total expenses")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("x", width / 2)
        .attr("y", pt / 2);
}

function step2From1(svg) {
    console.log("2 from 1");

    svg.select("#title").text("2019-20 expenses per student");

    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    // bar labels, axes out
    fade(container, ".rectLabel, .xAxis");

    // split lines in (t1)
    fade(container, ".splitLine", 0, true);

    // barGroups align top (t1)
    barGroups
        .data([...splitData].sort((a, b) => b.expensesPerStudent - a.expensesPerStudent))
        .join("g")
        .transition()
        .duration(animDuration)
        .style("transform", d => `translate(${xScale(d.school)}px, ${(graphHeight - d3.max(splitData.map(d => d.squareSide)) * squareScale) / 2}px)`);

    // main rects, split lines out (t2)
    fade(container, ".mainRect, .splitLine", 1);

    // single rects big (t3)
    container.selectAll(".singleRect")
        .transition()
        .delay(2 * animDuration)
        .duration(animDuration)
        .style("transform", `scale(${squareScale})`);

    // square labels in (t3)
    fade(container, ".squareLabel", 2, true);
}

function step1From2(svg) {
    console.log("1 from 2");

    svg.select("#title").text("2019-20 total expenses");

    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    // fade square labels out (t1)
    fade(container, ".squareLabel");

    // single rects small (t1)
    container.selectAll(".singleRect")
        .transition()
        .duration(animDuration)
        .style("transform", "scale(1)");

    // split lines, main rects in (t2)
    fade(container, ".splitLine, .mainRect", 1, true);

    // barGroups to position (t3)
    barGroups
        .data(splitData)
        .join("g")
        .transition()
        .delay(2 * animDuration)
        .duration(animDuration)
        .style("transform", d => `translate(${xScale(d.school)}px, ${d.startHeight}px)`);

    // split lines out (t3)
    fade(container, ".splitLine", 2);

    // axes, rect labels in (t3)
    fade(svg, ".rectLabel, .xAxis", 2, true);
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
