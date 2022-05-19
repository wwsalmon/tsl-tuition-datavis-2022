import React from 'react';
import D3Component from 'idyll-d3-component';
import * as d3 from 'd3';
import {allData, dataLabels, schoolLabels} from "../utils/data.js";

const totalScale = 350000000;
const fullSize = 600;
const padding = 5;
const pt = 24;

const revs = ["scripps", "hmc", "pitzer"].map(d => {
    const thisData = allData[d].find(x => x.year === 2020);
    const thisRev = Object.keys(thisData).filter(x => x.substring(0, 3) === "rev").map(x => thisData[x]).reduce((a, b) => a + b, 0);
    return {
        name: d,
        rev: thisRev,
        size: fullSize * thisRev / totalScale,
    };
});

class SpendingTreemapScale extends D3Component {
    initialize(node, props) {
        const svg = (this.svg = d3.select(node).append("svg"));
        svg
            .attr('viewBox', `0 0 400 ${pt + d3.max(revs.map(d => d.size))}`)
            .style('width', '100%')
            .style('height', 'auto');

        svg.append("text")
            .attr("dominant-baseline", "text-before-edge")
            .style("font-weight", 700)
            .style("font-size", 12)
            .text("Other schools' revenue to scale")

        const schoolGroups = svg.selectAll("g.school")
            .data(revs)
            .enter()
            .append("g")
            .style("transform", (d, i) => {
                let x = 0;
                for (let inc = 0; inc < i; inc++) {
                    x += revs[inc].size + padding;
                }
                return `translate(${x}px, ${pt}px)`;
            });

        schoolGroups.append("rect")
            .attr("width", d => d.size)
            .attr("height", d => d.size)
            .attr("fill", "#222");

        schoolGroups.append("text")
            .text(d => schoolLabels[d.name])
            .attr("dominant-baseline", "text-before-edge")
            .attr("dx", 8)
            .attr("dy", 8)
            .style("font-size", 12)
            .style("font-weight", 700)
            .attr("fill", "#fff");

        schoolGroups.append("text")
            .text(d => d3.format("$,")(d.rev))
            .attr("dominant-baseline", "text-before-edge")
            .attr("dx", 8)
            .attr("dy", 24)
            .style("font-size", 12)
            .attr("fill", "#fff");
    }
}

module.exports = SpendingTreemapScale;