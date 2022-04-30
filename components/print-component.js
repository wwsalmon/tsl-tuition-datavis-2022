import React from 'react';
import D3Component from 'idyll-d3-component';
import * as d3 from 'd3';
import data from "../data/tuition-and-cpi.json";

const labels = Object.keys(data[0]).filter(x => x !== "year");

const dataWithPercentages = data.sort((a, b) => a.year - b.year).map((d, i, a) => {
    let retval = {year: d.year};
    for (let label of labels) {
        retval[label] = d[label];
        if (i > 0 && a[0][label] && d[label]) {
            retval[label + "_cum"] = (d[label] - a[0][label])/a[0][label];
        } else {
            retval[label + "_cum"] = i === 0 ? 0 : null;
        }
        if (i > 0 && a[i-1][label] && d[label]) {
            retval[label + "_change"] = (a[i][label] - a[i-1][label])/a[i-1][label];
        } else {
            retval[label + "_change"] = null;
        }
    }
    return retval;
});

const allChange = dataWithPercentages.reduce((a, b) => {
    let retval = [...a];
    for (let label of labels) {
        retval.push(b[label + "_change"]);
    }
    return retval;
}, []);

const allCum = dataWithPercentages.reduce((a, b) => {
    let retval = [...a];
    for (let label of labels) {
        retval.push(b[label + "_cum"]);
    }
    return retval;
}, []);

const svgWidth = 800;
const chartHeight = 300;
const chartWidth = 500;

const cumScale = d3.scaleLinear().range([chartHeight, 0]).domain([0, 0.40]);
const timeScale = d3.scaleLinear().domain([2014, 2023]).range([0, chartWidth]);

const cumSeries = labels.map(label => dataWithPercentages.map(year => ({year: year.year, value: year[label], cum: year[label + "_cum"]})));

console.log(cumSeries);

class PrintComponent extends D3Component {
    initialize(node, props) {
        const svg = (this.svg = d3.select(node).append('svg'));

        svg
            .attr('viewBox', `0 0 ${svgWidth} 600`)
            .style('width', '100%')
            .style('max-width', svgWidth)
            .style("margin", "0 auto")
            .style("display", "block")
            .attr("fill", "#222");

        const chart = svg.append("g")
            .style("transform", `translate(${(svgWidth - chartWidth) / 2}px, 280px)`);

        const line = d3.line()
            .x(d => timeScale(d.year))
            .y(d => cumScale(d.cum))
            .curve(d3.curveMonotoneX);

        console.log(line(cumSeries[0]));

        chart.selectAll("line.cumLine").data(cumSeries.slice(0, 8)).enter()
            .append("path")
            .attr("d", x => line(x.filter(y => y.cum !== null)))
            .attr("stroke-width", 2)
            .attr("stroke", (d, i) => i > 4 ? "#bbb" : "black")
            .attr("stroke-dasharray", (d, i) => ["4 0", "8 8", "6 6", "4 4", "2 2", "4 4", "8 8", "4 0"][i])
            .attr("fill", "transparent")

        chart.append("g")
            .attr("id", "timeAxis")
            .call(d3.axisBottom(timeScale).tickFormat(d => d).tickSize(-chartHeight))
            .style("transform", `translate(0, ${chartHeight}px)`);

        d3.selectAll("#timeAxis .tick line").style("opacity", 0.2);
        d3.selectAll("#timeAxis .tick text").style("transform", "translate(0, 8px)");

        chart.append("g")
            .attr("id", "cumAxis")
            .call(d3.axisLeft(cumScale).tickFormat(d3.format(".0%")).tickSize(-chartWidth));

        d3.selectAll("#cumAxis .tick line").style("opacity", 0.2);
    }

    update(props, oldProps) {
        const {state} = props;
    }
}

export default PrintComponent;