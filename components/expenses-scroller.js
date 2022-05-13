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

const width = 1920;
const height = 1080;

function step1Chart(container, field, graphWidth, graphHeight) {
    const yScale = d3.scaleLinear().domain([0, d3.max(expData.map(d => d[field]))]).range([graphHeight, 0]);
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

    const barGroups = container
        .selectAll("g.barGroups")
        .data(splitData)
        .enter()
        .append("g")
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
        .selectAll("path.vertSplit")
        .data(d => Array(d.numShortSide).fill(d.squareSide))
        .enter()
        .append("path")
        .attr("class", "vertSplit")
        .attr("d", (d,i) => d3.line()([[i * d, 0], [i * d, graphHeight]]))
        .attr("stroke", "white")
        .attr("strokeWidth", 1);

    barGroups
        .selectAll("path.horzSplit")
        .data(d => Array(d.numLongSide).fill(d.squareSide))
        .enter()
        .append("path")
        .attr("class", "horzSplit")
        .attr("d", (d,i) => d3.line()([[0, i * d], [bandwidth, i * d]]))
        .attr("stroke", "white")
        .attr("strokeWidth", 1);

    container.selectAll(".horzSplit, .vertSplit")
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(750)
        .style("opacity", 1)
        .transition()
        .delay(1000)
        .duration(750)
        .style("opacity", 0);

    container.append("g").attr("class", "xAxis").call(d3.axisBottom(xScale).tickSize(0)).style("transform", `translateY(${graphHeight}px)`);

    container.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

    container.selectAll(".xAxis, .yAxis")
        .transition()
        .delay(1000)
        .duration(750)
        .style("opacity", 0);

    container.selectAll(".singleRect")
        .transition()
        .delay(4250)
        .duration(750)
        .style("transform", "scale(20)");

    container.selectAll(".mainRect")
        .transition()
        .delay(2750)
        .duration(750)
        .style("opacity", 0);

    barGroups
        .transition()
        .delay(3500)
        .duration(750)
        .style("transform", d => `translate(${xScale(d.school)}px, 0px)`);
}

function step1On(svg) {
    const graphHeight = 800;
    const pl = 48;
    const pr = 48;
    const pb = 48;
    const graphWidth = width - pl - pr;
    const totalHeight = graphHeight + pb;

    const transformY = (height - totalHeight) / 2;
    const expensesChart = svg.append("g").style("transform", `translate(${pl}px, ${transformY}px)`);
    const expensesPerStudentChart = svg.append("g").style("transform", `translate(${width / 2 + pl}px, ${transformY}px)`);

    step1Chart(expensesChart, "expenses", graphWidth, graphHeight);
}

class ExpensesScroller extends D3Component {
    initialize(node, props) {
        const {step} = props;

        const svg = (this.svg = d3.select(node).append("svg"));

        step1On(svg);

        svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "100vh");

        svg
            .append('circle')
            .attr('r', 20)
            .attr('cx', Math.random() * width)
            .attr('cy', Math.random() * height);
    }

    update(props, oldProps) {
        const {step} = props;

        console.log(step);

        this.svg
            .selectAll('circle')
            .transition()
            .duration(750)
            .attr('cx', Math.random() * width)
            .attr('cy', Math.random() * height);
    }
}

module.exports = ExpensesScroller;
