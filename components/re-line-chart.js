import {aggLabels, allData, dataLabels, schoolLabels, tAndCLabels} from "../utils/data.js";
import tuitionAndCpiData from "../data/tuition-and-cpi.json";
import finaidData from "../data/finaid.json";
import React from "react";
import calculateChange from "../utils/calculateChange.js";
import {Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart} from "recharts";
import * as d3 from "d3";

export default function ReLineChart({fields, school, isCum = false, range, formatString, numYears = 8}) {
    let data;

    if (school) {
        const thisSchoolData = allData[school];

        data = thisSchoolData.map(d => fields.reduce((a, b) => {
            let retval = {...a};
            if (b === "finaid") {
                retval[b] = finaidData.find(x => x.year === d.year)[school];
            } else if (tAndCLabels.includes(b) || aggLabels.includes(b)) {
                if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"];
                } else if (b === "rev_all") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_contributions"] + d["rev_students"];
                } else if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_students"];
                    if (["cmc", "pomona"].includes(school)) retval[school] = retval[school] * 1000;
                } else {
                    retval[b] = tuitionAndCpiData.find(x => x.year === d.year)[b === "tuition" ? school : b];
                }
            } else {
                retval[b] = d[b];
            }
            return retval;
        }, {year: d.year}));
    } else {
        data = Array(numYears).fill(0).map((d,i) => {
            let retval = {year: 2014 + +i};

            const mainField = fields[0];

            for (let school of Object.keys(schoolLabels)) {
                const thisSchoolYear = allData[school].find(x => x.year === (2014 + +i));

                if (thisSchoolYear || (+i > 7 && mainField === "tuition")) {
                    if (mainField === "finaid") {
                        retval[school] = finaidData.find(x => x.year === (2014 + +i))[school];
                    } else if (mainField === "tuition") {
                        retval[school] = tuitionAndCpiData.find(x => x.year === (2014 + +i))[school];
                    } else if (mainField === "rev_all") {
                        retval[school] = thisSchoolYear["rev_students"] + thisSchoolYear["rev_contributions"] + thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
                        if (["cmc", "pomona"].includes(school)) retval[school] = retval[school] * 1000;
                    } else if (mainField === "rev_cleaned") {
                        retval[school] = thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
                        if (["cmc", "pomona"].includes(school)) retval[school] = retval[school] * 1000;
                    } else if (mainField === "rev_wo_gifts") {
                        retval[school] = thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"] + thisSchoolYear["rev_students"];
                        if (["cmc", "pomona"].includes(school)) retval[school] = retval[school] * 1000;
                    } else {
                        retval[school] = thisSchoolYear[mainField];
                    }
                }
            }

            const otherFields = fields.slice(1).filter(x => tAndCLabels.includes(x));

            for (let field of otherFields) {
                retval[field] = tuitionAndCpiData.find(x => x.year === (2014 + +i))[field];
            }

            return retval;
        });
    }

    data = data.sort((a, b) => +a.year - +b.year);

    if (isCum) {
        data = calculateChange(data, ["year"]);

        data = data.map(d => {
            let retval = {year: `${d.year - 1}-${d.year}`};
            for (let field of Object.keys(data[0]).filter(d => d.substring(d.length - 3) === "cum")) {
                retval[dataLabels[field.substring(0, field.length - 4)]] = d[field];
            }
            return retval;
        });
    } else {
        data = data.map(d => {
            let retval = {year: `${d.year - 1}-${d.year}`};
            for (let field of Object.keys(data[0]).slice(1)) {
                retval[dataLabels[field]] = d[field];
            }
            return retval;
        });
    }

    const preColorScale = d3.scaleOrdinal()
        .domain(["cmc", "hmc", "pomona", "scripps", "pitzer", "nat", "la", "ca"].map(d => dataLabels[d]))
        .range(["#910039","#333333","#01549A","#33735B","#E89200","#bbbbbb","#bbbbbb","#bbbbbb"]);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const formatter = d => d3.format(formatString || (isCum ? ".00%" : ","))(d);

    return (
        <div style={{margin: "48px 0"}}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <XAxis dataKey="year" style={{fontSize: 14}}/>
                    <YAxis style={{fontSize: 14}} domain={range || ["auto", "auto"]} tickFormatter={formatter}/>
                    <Legend wrapperStyle={{fontSize: 14}} iconType="circle"/>
                    <Tooltip wrapperStyle={{fontSize: 14}} formatter={formatter}/>
                    {Object.keys(data[0]).slice(1).map(field => (
                        <Line type="monotone" dataKey={field} key={field} strokeWidth={2}
                              stroke={(Object.values(schoolLabels).includes(field) || tAndCLabels.map(d => dataLabels[d]).includes(field)) ? preColorScale(field) : colorScale(field)}
                              dot={false}
                              strokeDasharray={(field === "National CPI") ? "3 3" : (field === "LA County CPI") ? "6 6" : (field === "California CPI") ? "12 12" : "3 0"}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}