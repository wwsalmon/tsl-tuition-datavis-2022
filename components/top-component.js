import React from 'react';
import D3Component from 'idyll-d3-component';
import * as d3 from 'd3';
import data from "../data/tuition-and-cpi.json" assert {type: "json"};

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

const svgWidth = 900;
const chartHeight = 300;
const chartWidth = 500;

const cumScale = d3.scaleLinear().range([chartHeight, 0]).domain([0, d3.max(allCum)]);
const timeScale = d3.scaleLinear().domain([2014, 2023]).range([0, chartWidth]);

const cumSeries = labels.map(label => dataWithPercentages.map(year => ({year: year.year, value: year[label], cum: year[label + "_cum"]})));

// from http://bl.ocks.org/JMStewart/6455921
function pathTween(path){
    const length = path.node().getTotalLength(); // Get the length of the path
    const r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
    return function(t){
        const point = path.node().getPointAtLength(r(t)); // Get the next point along the path
        d3.select(this) // Select the circle
            .attr("cx", point.x) // Set the cx
            .attr("cy", point.y) // Set the cy
    }
}

class TopComponent extends D3Component {
    initialize(node, props) {
        const svg = (this.svg = d3.select(node).append('svg'));

        svg
            .attr('viewBox', `0 0 ${svgWidth} 700`)
            .style('width', '100%')
            .style('max-width', svgWidth)
            .style("margin", "0 auto")
            .style("display", "block")
            .attr("fill", "#222");

        const defs = svg.append("defs");

        const clipRect1 = defs.append("clipPath").attr("id", "clipRect1").append("rect").attr("height", chartHeight).attr("width", 0).attr("fill", "red");
        const clipRect2 = defs.append("clipPath").attr("id", "clipRect2").append("rect").attr("height", chartHeight).attr("width", 0).attr("fill", "red");

        const labelText = svg.append("text")
            .text("POMONA COLLEGE TUITION")
            .style("font-size", 20)
            .attr("fill", "white")
            .attr("x", "50%")
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("class", "font-lora");

        const yearText = svg.append("text")
            .text("2013-14")
            .style("font-size", 20)
            .style("font-weight", 700)
            .attr("fill", "white")
            .attr("x", "50%")
            .attr("y", 24)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("class", "font-lora");

        const tuitionText = svg.append("text")
            .text("$43,255")
            .style("font-size", 128)
            .style("font-weight", 700)
            .attr("fill", "white")
            .attr("x", "50%")
            .attr("y", 96)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("class", "font-lora");

        const chart = svg.append("g")
            .style("transform", `translate(${(svgWidth - chartWidth) / 2}px, 300px)`);

        const line = d3.line()
            .x(d => timeScale(d.year))
            .y(d => cumScale(d.cum))
            .curve(d3.curveMonotoneX);

        console.log(line(cumSeries[0]));

        const cumLines = chart.selectAll("line.cumLine").data([...cumSeries.slice(0,5), cumSeries[7]]).enter()
            .append("path")
            .attr("d", x => line(x.filter(y => y.cum !== null)))
            .attr("stroke-width", 4)
            .attr("stroke", (d, i) => i > 4 ? "red" : "white")
            .attr("fill", "transparent")
            .attr("clip-path", (d, i) => `url(#clipRect${i > 0 ? 2 : 1})`)
            .style("opacity", (d, i) => i > 0 ? 0.25 : 1);

        const indicatorPath = chart
            .append("path")
            .datum(cumSeries[0])
            .attr("d", line)
            .attr("stroke", "transparent")
            .attr("fill", "transparent");

        const indicator = chart
            .append("circle")
            .attr("cx", 0)
            .attr("cy", chartHeight)
            .attr("r", 10)
            .attr("fill", "white");

        const changeLabel = chart
            .append("text")
            .attr("y", cumScale(cumSeries[0][cumSeries[0].length - 1].cum))
            .attr("fill", "white")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "start")
            .style("opacity", 0);

        const changeLabelNumber = changeLabel
            .append("tspan")
            .text("+" + d3.format(".00%")(cumSeries[0][cumSeries[0].length - 1].cum))
            .attr("x", chartWidth + 32)
            .style("font-size", 48)
            .style("font-weight", 700);

        const changeLabelUnder = changeLabel
            .append("tspan")
            .text("since 2014")
            .attr("x", chartWidth + 32)
            .attr("dy", 32)
            .style("font-size", 20)

        const pomCumSeries = cumSeries[0];

        const transitionTime = 3000;
        const delay = 500;
        const secondDelay = delay + transitionTime - 1000;

        indicator.transition().delay(delay).duration(transitionTime).tween("pathTween", () => pathTween(indicatorPath));

        tuitionText.transition().delay(delay).duration(transitionTime).textTween(() => t => `$${d3.format(",")((d3.easeCubicInOut(t) * (pomCumSeries[pomCumSeries.length - 1].value - pomCumSeries[0].value) + pomCumSeries[0].value).toFixed(0))}`);
        yearText.transition().delay(delay).duration(transitionTime).textTween(() => t => `20${(d3.easeCubicInOut(t) * 9 + 13).toFixed(0)}-${(d3.easeCubicInOut(t) * 9 + 14).toFixed(0)}`);

        clipRect1.transition().delay(delay).duration(transitionTime).attr("width", chartWidth);
        clipRect2.transition().delay(secondDelay).duration(transitionTime).attr("width", chartWidth);

        changeLabel.transition().delay(secondDelay).duration(transitionTime).style("opacity", 1.0);
    }

    update(props, oldProps) {
        const {state} = props;
    }
}

export default TopComponent;