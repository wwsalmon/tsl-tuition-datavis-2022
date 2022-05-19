import {aggLabels, allData, dataLabels, expCats, schoolLabels, tAndCLabels} from "../utils/data.js";
import tuitionAndCpiData from "../data/tuition-and-cpi.json";
import React from "react";
import calculateChange from "../utils/calculateChange.js";
import {Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart} from "recharts";
import * as d3 from "d3";
import getColor from "../utils/getColor.js";

module.exports = function ReLineChart({fields, school, isCum = false, range, formatPercentString, formatMoneyString, numYears = 7, include2021 = false}) {
    let data;

    if (school) {
        const thisSchoolData = allData[school].filter(d => include2021 || d.year !== 2021);

        data = thisSchoolData.map(d => fields.reduce((a, b) => {
            let retval = {...a};
            if (Object.keys(expCats).includes(b)) {
                retval[b] = expCats[b].map(x => d[x] || 0).reduce((a, b) => a + b, 0);
            } else if (tAndCLabels.includes(b) || aggLabels.includes(b)) {
                if (b === "exp_all") {
                    retval[b] = Object.keys(d).filter(x => x.substring(0, 3) === "exp").map(x => d[x]).reduce((a, b) => a + b, 0);
                } else if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"];
                } else if (b === "rev_all") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_contributions"] + d["rev_students"];
                } else if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_students"];
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
                    if (mainField === "tuition") {
                        retval[school] = tuitionAndCpiData.find(x => x.year === (2014 + +i))[school];
                    } else if (mainField === "rev_all") {
                        retval[school] = thisSchoolYear["rev_students"] + thisSchoolYear["rev_contributions"] + thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
                    } else if (mainField === "rev_cleaned") {
                        retval[school] = thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
                    } else if (mainField === "rev_wo_gifts") {
                        retval[school] = thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"] + thisSchoolYear["rev_students"];
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
    const oldData = [...data];

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

    const formatterPercent = d => d3.format(formatPercentString || ".00%")(d);
    const formatterMoney = d => d3.format(formatMoneyString || "$0,")(d);
    const axisFormatter = isCum ? formatterPercent : formatterMoney;

    return (
        <div style={{margin: "48px 0"}}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <XAxis dataKey="year" style={{fontSize: 14}}/>
                    <YAxis style={{fontSize: 14}} domain={range || ["auto", "auto"]} tickFormatter={axisFormatter}/>
                    <Legend wrapperStyle={{fontSize: 14}} iconType="circle"/>
                    {isCum ? (
                        <Tooltip wrapperStyle={{fontSize: 14}} content={({label, payload}) => {
                            if (payload.length) {
                                const year = +payload[0].payload.year.substring(5, 9);
                                const thisOldData = oldData.find(d => d.year === year);

                                return (
                                    <div style={{padding: 12, backgroundColor: "white", border: "1px solid #ccc"}}>
                                        <div style={{marginBottom: 8}}><span>{label}</span></div>
                                        {payload.map((item, i) => {
                                            const field = Object.keys(dataLabels).find(key => dataLabels[key] === item.name);
                                            const thisOldValue = thisOldData[field];

                                            return (
                                                <div style={{color: getColor(item.name), marginTop: 8}} key={field}>
                                                    <span>
                                                        {item.name}: {formatterPercent(item.value.toString())} ({formatterMoney(thisOldValue)})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            return null;
                        }}/>
                    ) : (
                        <Tooltip wrapperStyle={{fontSize: 14}} formatter={formatterMoney}/>
                    )}
                    {Object.keys(data[0]).slice(1).map(field => (
                        <Line type="monotone" dataKey={field} key={field} strokeWidth={2}
                              stroke={getColor(field)}
                              dot={false}
                              strokeDasharray={(field === "National CPI") ? "3 3" : (field === "LA County CPI") ? "6 6" : (field === "California CPI") ? "12 12" : "3 0"}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}