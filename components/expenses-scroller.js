import getColor from "../utils/getColor.js";

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
import {allData, dataLabels, schoolLabels} from "../utils/data.js";

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
const treemapPadding = 24;
const treemapScale = 37;
const treemapTextPadding = 8;
const treemapTextSize = 10;

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

const treemapData = Object.fromEntries(splitData.map(d => {
    const thisData = allData[d.school].find(d => d.year === 2020);
    const thisTreemapData = {
        name: d.school,
        children: Object.keys(thisData).filter(d => d.substring(0, 3) === "exp").map(d => ({name: d, value: thisData[d]})),
    };
    const root = d3.hierarchy(thisTreemapData);
    const size = treemapScale * d.squareSide;
    const rootNode = root.sum(d => d.value).sort((a, b) => b.height - a.height || b.value - a.value);
    d3.treemap().size([size, size]).padding(2).tile(d3.treemapBinary)(rootNode);
    const leaves = rootNode.leaves();

    return [
        d.school,
        leaves,
    ];
}));

console.log(treemapData);

function fade(container, selector, delayCount = 0, fadeIn = false) {
    container.selectAll(selector)
        .transition()
        .delay(delayCount * animDuration)
        .duration(animDuration)
        .style("opacity", +fadeIn);
}

function alignBarGroupsForStep2(barGroups, delayCount = 0) {
    barGroups
        .data([...splitData].sort((a, b) => b.expensesPerStudent - a.expensesPerStudent))
        .join("g")
        .transition()
        .delay(delayCount * animDuration)
        .duration(animDuration)
        .style("transform", d => `translate(${xScale(d.school)}px, ${(graphHeight - d3.max(splitData.map(d => d.squareSide)) * squareScale) / 2}px)`);
}

function highlightCells(barGroups, values = []) {
    const cells = barGroups
        .data(splitData)
        .join("g")
        .selectAll("g.treemapCell")
        .data(d => treemapData[d.school])
        .join("g");

    cells
        .select("rect")
        .transition()
        .duration(animDuration)
        .attr("fill", d => values.includes(d.data.name) ? "#222" : getColor(schoolLabels[d.parent.data.name]));
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

    const cells = barGroups
        .selectAll("g.treemapCell")
        .data(d => treemapData[d.school])
        .enter()
        .append("g")
        .attr("class", "treemapCell")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .style("opacity", 0);

    cells.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => getColor(schoolLabels[d.parent.data.name]));

    cells.append("text")
        .text(d => dataLabels[d.data.name])
        .attr("fill", "white")
        .style("font-weight", 700)
        .style("font-size", treemapTextSize)
        .attr("dominant-baseline", "text-before-edge")
        .attr("dy", treemapTextPadding)
        .attr("dx", treemapTextPadding);

    cells.append("text")
        .text(d => d3.format("$,")(d.value))
        .attr("fill", "white")
        .style("font-size", treemapTextSize)
        .attr("dominant-baseline", "text-before-edge")
        .attr("dy", treemapTextPadding + treemapTextSize * 1.2)
        .attr("dx", treemapTextPadding);
}

function step1From2(svg) {
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

function step2From1(svg) {
    svg.select("#title").text("2019-20 expenses per student");

    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    // bar labels, axes out
    fade(container, ".rectLabel, .xAxis");

    // split lines in (t1)
    fade(container, ".splitLine", 0, true);

    // barGroups align top (t1)
    alignBarGroupsForStep2(barGroups);

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

function step2From3(svg) {
    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    // show singleRect
    fade(container, ".singleRect", 0, true);

    // fade treemaps (t1)
    fade(svg, ".treemapCell");

    // single rects size down (t2)
    container.selectAll(".singleRect")
        .transition()
        .delay(animDuration)
        .duration(animDuration)
        .style("transform", `scale(${squareScale})`);

    // barGroups align (t2)
    alignBarGroupsForStep2(barGroups, 1);

    // show labels
    fade(svg, ".squareLabel, #title", 1, true);
}

function step3From2(svg) {
    const container = svg.select("#container");
    const barGroups = svg.selectAll(".barGroup");

    fade(svg, ".squareLabel, #title");

    const squareY = (school) => ["pomona", "cmc"].includes(school) ? 0 : splitData.find(d => d.school === "pomona").squareSide * treemapScale + treemapPadding;
    const squareX = (school) => ({
        "pomona": 0,
        "cmc": treemapScale * splitData.find(d => d.school === "pomona").squareSide + treemapPadding,
        "hmc": 0,
        "scripps": treemapScale * splitData.find(d => d.school === "hmc").squareSide + treemapPadding,
        "pitzer": treemapScale * (splitData.find(d => d.school === "hmc").squareSide + splitData.find(d => d.school === "scripps").squareSide) + 2 * treemapPadding,
    }[school]);

    barGroups
        .data(splitData)
        .join("g")
        .transition()
        .duration(animDuration)
        .style("transform", d => `translate(${squareX(d.school)}px, ${squareY(d.school)}px)`);

    container.selectAll(".singleRect").transition().duration(animDuration).style("transform", `scale(${treemapScale})`);

    fade(container, ".singleRect", 1);

    fade(container, ".treemapCell", 1, true);
}

function step3From4(svg) {
    const barGroups = svg.selectAll(".barGroup");

    highlightCells(barGroups);
}

function step4(svg) {
    const barGroups = svg.selectAll(".barGroup");

    highlightCells(barGroups, ["exp_instruction", "exp_research", "exp_academic_support", "exp_academic"]);
}

function step5(svg) {
    const barGroups = svg.selectAll(".barGroup");

    highlightCells(barGroups, ["exp_cocurricular", "exp_student_services", "exp_auxiliary_enterprises"]);
}

function step6(svg) {
    const barGroups = svg.selectAll(".barGroup");

    highlightCells(barGroups, ["exp_admin", "exp_marketing", "exp_institutional_support"]);
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
        const {step: oldStep} = oldProps;

        if (step > 2) return eval(`step${step + 1}(this.svg)`);

        if (Math.abs(step - oldStep) === 1 && oldStep !== -1) eval(`step${step + 1}From${oldStep + 1}(this.svg)`);
    }
}

module.exports = ExpensesScroller;
