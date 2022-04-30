import React from 'react';
import D3Component from 'idyll-d3-component';
import * as d3 from 'd3';
import tuitionAndCpiData from "../data/tuition-and-cpi.json";
import {aggLabels, allData, dataLabels, tAndCLabels} from "../utils/data.js";
import calculateChange from "../utils/calculateChange.js";

const width = 600;
const height = 400;
const paddingTop = 8;
const paddingLeft = 32;
const paddingBottom = 40;
const paddingRight = 24;
const legendRowHeight = 20;

class LineChart extends D3Component {
    initialize(node, props) {
        const {school, fields} = props;

        const thisSchoolData = allData[school];

        let data = thisSchoolData.map(d => fields.reduce((a, b) => {
            let retval = {...a};
            if (tAndCLabels.includes(b) || aggLabels.includes(b)) {
                if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"];
                } else if (b === "rev_all") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_contributions"] + d["rev_students"];
                } else {
                    retval[b] = tuitionAndCpiData.find(x => x.year === d.year)[b === "tuition" ? school : b];
                }
            } else {
                retval[b] = d[b];
            }
            return retval;
        }, {year: d.year}));

        data = calculateChange(data.sort((a, b) => +a.year - +b.year), ["year"]);

        const cumSeries = fields.map(d => data.map(x => ({year: x.year, value: x[d+"_cum"]})));

        const allCum = data.reduce((a, b) => {
            let retval = [...a];
            for (let field of Object.keys(b)) {
                if (field.substring(field.length - 3) === "cum") retval.push(b[field]);
            }

            return retval;
        }, []);

        const cumScale = d3.scaleLinear().domain([0, d3.max(allCum)]).range([height - paddingBottom - paddingTop - fields.length * legendRowHeight, 0]);
        const timeScale = d3.scaleLinear().domain(d3.extent(data.map(d => d.year))).range([0, width - paddingLeft - paddingRight]);
        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = (this.svg = d3.select(node).append('svg'));

        svg
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('width', '100%')
            .style('height', 'auto');

        const chart = svg.append("g").style("transform", `translate(${paddingLeft}px, ${paddingTop}px)`);

        chart.append("g").call(d3.axisBottom(timeScale).tickFormat(d => `${d-1}-${d}`).ticks(7)).style("transform", `translateY(${height - paddingBottom - paddingTop - fields.length * legendRowHeight}px)`);
        chart.append("g").call(d3.axisLeft(cumScale).tickFormat(d3.format(".00%")));

        const line = d3.line()
            .x(d => timeScale(d.year))
            .y(d => cumScale(d.value))
            .curve(d3.curveMonotoneX);

        chart.selectAll("line.cumLine")
            .data(cumSeries)
            .enter()
            .append("path")
            .attr("d", d => line(d.filter(x => x.value !== null)))
            .attr("stroke", (d, i) => colorScale(fields[i]))
            .attr("fill", "transparent")
            .attr("stroke-width", 3);

        const legend = svg
            .append("g")
            .style("transform", `translate(${paddingLeft}px, ${height - fields.length * legendRowHeight}px)`);

        const legendGroups = legend.selectAll("g.legendGroup")
            .data(fields)
            .enter()
            .append("g")
            .style("transform", (d, i) => `translateY(${i * legendRowHeight}px)`);

        legendGroups.append("circle")
            .attr("r", 6)
            .attr("cy", legendRowHeight / 2)
            .attr("fill", d => colorScale(d));

        legendGroups.append("text")
            .attr("dx", 20)
            .text(d => dataLabels[d])
            .style("font-size", 14)
            .attr("dy", legendRowHeight / 2)
            .attr("dominant-baseline", "middle");
    }

    update(props, oldProps) {
    }
}

export default LineChart;
