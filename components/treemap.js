import React from 'react';
import D3Component from 'idyll-d3-component';
import * as d3 from 'd3';
import {allData, dataLabels, schoolLabels} from "../utils/data.js";

class Treemap extends D3Component {
    initialize(node, props) {
        const {school, year, viewWidth, totalScale, center} = props;

        const data = allData[school];

        const thisData = data.find(d => d.year === year);

        let root = {name: thisData.year};
        root.children = Object.keys(thisData).filter(d => d.substring(0, 3) === "rev").map(d => ({name: d, value: thisData[d]}));

        const revTotal = root.children.reduce((a, b) => a + +b.value, 0);


        const fullSize = 600;
        const size = fullSize * Math.sqrt(revTotal / (totalScale || 400000000));
        const textPadding = 8;
        const textHeight = 16;

        root = d3.hierarchy(root);
        const rootNode = root.sum(d => d.value).sort((a, b) => b.height - a.height || b.value - a.value);

        d3.treemap().size([size, size]).padding(2).tile(d3.treemapBinary)(rootNode);

        const leaves = rootNode.leaves();

        const svg = (this.svg = d3.select(node).append('svg'));
        svg
            .attr('viewBox', `0 0 ${viewWidth || fullSize} ${size + textPadding + 2 * textHeight}`)
            .style('width', '100%')
            .style('height', 'auto');

        const chart = svg.append("g");

        if (center) chart.style("transform", `translateX(${((viewWidth || fullSize) - +size) / 2}px)`);

        const treeChart = chart.append("g")
            .style("transform", `translateY(${3 * textPadding + 2 * textHeight}px)`);

        const cells = treeChart.selectAll("cell")
            .data(leaves)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .on("mouseover", (d, b) => {
                d3.select(d.currentTarget).style("opacity", 0.5);
                d3.select("#tooltip")
                    .html(`${dataLabels[b.data.name]}: ${d3.format("$,")(b.data.value)}`)
                    .style("display", "block")
                    .style("left", d.pageX + 2 + "px")
                    .style("top", d.pageY + 2 + "px");
            })
            .on("mousemove", d => {
                d3.select("#tooltip")
                    .style("left", d.pageX + 2 + "px")
                    .style("top", d.pageY + 2 + "px");
            })
            .on("mouseout", d => {
                d3.select("#tooltip").style("display", "none");
                d3.select(d.currentTarget).style("opacity", 1.0);
            });

        cells.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => (d.data.name === "rev_endowment") ? "#BE3232" : ((d.data.name === "rev_students") ? "#3274BE" : "#222"));

        cells.append("text")
            .text(d => dataLabels[d.data.name])
            .attr("fill", "white")
            .style("font-weight", 700)
            .style("font-size", 12)
            .attr("dominant-baseline", "text-before-edge")
            .attr("dy", textPadding)
            .attr("dx", textPadding);

        cells.append("text")
            .text(d => d3.format("$,")(d.value))
            .attr("fill", "white")
            .style("font-size", 12)
            .attr("dominant-baseline", "text-before-edge")
            .attr("dy", textPadding + textHeight)
            .attr("dx", textPadding);

        const textGroup = chart.append("g");

        textGroup.append("text")
            .text(schoolLabels[school])
            .attr("dominant-baseline", "text-before-edge")
            .attr("y", textPadding)
            .style("font-size", 14)
            .style("font-weight", 700);

        textGroup.append("text")
            .text(`${year - 1}-${year} revenue`)
            .attr("dominant-baseline", "text-before-edge")
            .attr("y", textPadding + textHeight)
            .style("font-size", 14);

        textGroup.append("text")
            .text(`Total revenue`)
            .attr("dominant-baseline", "text-before-edge")
            .attr("text-anchor", "end")
            .attr("y", textPadding)
            .attr("x", size)
            .style("font-size", 14)
            .style("font-weight", 700);

        textGroup.append("text")
            .text(d3.format("$,")(revTotal))
            .attr("dominant-baseline", "text-before-edge")
            .attr("text-anchor", "end")
            .attr("y", textPadding + textHeight)
            .attr("x", size)
            .style("font-size", 14);
    }

    update(props, oldProps) {

    }
}

module.exports = Treemap;