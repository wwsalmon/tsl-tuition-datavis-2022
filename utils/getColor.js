import * as d3 from "d3";
import {dataLabels, schoolLabels, tAndCLabels} from "./data.js";

const preColorScale = d3.scaleOrdinal()
    .domain(["cmc", "hmc", "pomona", "scripps", "pitzer", "nat", "la", "ca"].map(d => dataLabels[d]))
    .range(["#910039","#666666","#01549A","#33735B","#E89200","#bbbbbb","#bbbbbb","#bbbbbb"]);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

export default function getColor(field) {
    return (Object.values(schoolLabels).includes(field) || tAndCLabels.map(d => dataLabels[d]).includes(field)) ? preColorScale(field) : colorScale(field);
}