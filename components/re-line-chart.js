import {aggLabels, allData, dataLabels, expCats, schoolLabels, tAndCLabels} from "../utils/data.js";
import tuitionAndCpiData from "../data/tuition-and-cpi.json";
import React from "react";
import calculateChange from "../utils/calculateChange.js";
import {Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart} from "recharts";
import * as d3 from "d3";
import getColor from "../utils/getColor.js";

function getData(thisSchoolYear, field, school, year) {
    if (field === "tuition") {
        return tuitionAndCpiData.find(x => x.year === year)[school];
    } else if (!thisSchoolYear) {
        return null;
    } else if (field === "exp_all") {
        return Object.keys(thisSchoolYear).filter(x => x.substring(0, 3) === "exp").map(x => thisSchoolYear[x]).reduce((a, b) => a + b, 0);
    } else if (field === "exp_per_student") {
        const exp_total = Object.keys(thisSchoolYear).filter(x => x.substring(0, 3) === "exp").map(x => thisSchoolYear[x]).reduce((a, b) => a + b, 0);
        const enrollment = thisSchoolYear.enrollment;
        return exp_total / enrollment;
    } else if (field === "rev_all") {
        return thisSchoolYear["rev_students"] + thisSchoolYear["rev_contributions"] + thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
    } else if (field === "rev_cleaned") {
        return thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"];
    } else if (field === "rev_wo_gifts") {
        return thisSchoolYear["rev_endowment"] + thisSchoolYear["rev_other"] + thisSchoolYear["rev_students"];
    } else if (field === "cost_on_aid") {
        return thisSchoolYear["tuition"] + thisSchoolYear["non_tuition_cost"] - thisSchoolYear["finaid"] / thisSchoolYear["num_on_aid"];
    } else if (field === "perc_on_aid") {
        return thisSchoolYear["num_on_aid"] / thisSchoolYear["enrollment"];
    } else {
        return thisSchoolYear[field];
    }
}

function getFieldName(field, isSpecial = false) {
    if (isSpecial) {
        return dataLabels[field.split("/")[0]] + ": " + dataLabels[field.split("/")[1]];
    } else {
        return dataLabels[field];
    }
}

module.exports = function ReLineChart({fields, school, isTwoFields = false, isCum = false, range, formatPercentString, formatMoneyString, numYears = 7, include2021 = false, showPerYear = false}) {
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
                } else if (b === "exp_per_student") {
                    const exp_total = Object.keys(d).filter(x => x.substring(0, 3) === "exp").map(x => d[x]).reduce((a, b) => a + b, 0);
                    const enrollment = d.enrollment;
                    retval[b] = exp_total / enrollment;
                } else if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"];
                } else if (b === "rev_all") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_contributions"] + d["rev_students"];
                } else if (b === "rev_cleaned") {
                    retval[b] = d["rev_endowment"] + d["rev_other"] + d["rev_students"];
                } else if (b === "cost_on_aid") {
                    retval[b] = d["tuition"] + d["non_tuition_cost"] - d["finaid"] / d["num_on_aid"];
                } else if (b === "perc_on_aid") {
                    retval[b] = d["num_on_aid"] / d["enrollment"];
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
            const year = 2014 + i;
            let retval = {year: year};

            for (let school of Object.keys(schoolLabels)) {
                const thisSchoolYear = allData[school].find(x => x.year === year);

                if (thisSchoolYear || !isCum || (!isTwoFields && fields[0] === "tuition")) {
                    if (isTwoFields) {
                        const firstField = fields[0];
                        const secondField = fields[1];
                        retval[school + "/" + firstField] = getData(thisSchoolYear, firstField, school, year);
                        retval[school + "/" + secondField] = getData(thisSchoolYear, secondField, school, year);
                    } else {
                        retval[school] = getData(thisSchoolYear, fields[0], school, year);
                    }
                }
            }

            const otherFields = fields.slice(1 + +isTwoFields).filter(x => tAndCLabels.includes(x));

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
                let fieldName = field.substring(0, field.length - 4);
                fieldName = getFieldName(fieldName, !school && isTwoFields);
                retval[fieldName] = d[field];
            }
            return retval;
        });
    } else {
        data = data.map(d => {
            let retval = {year: `${d.year - 1}-${d.year}`};
            for (let field of Object.keys(data[0]).slice(1)) {
                const fieldName = getFieldName(field, !school && isTwoFields);
                retval[fieldName] = d[field];
            }
            return retval;
        });
    }

    const formatterPercent = d => d3.format(formatPercentString || ".2%")(d);
    const formatterMoney = d => d3.format(formatMoneyString || "$0,")(formatMoneyString ? d : d.toFixed(2));
    const axisFormatter = isCum ? formatterPercent : formatterMoney;

    return (
        <div style={{margin: "48px 0"}}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{left: 20}}>
                    <XAxis dataKey="year" style={{fontSize: 14}}/>
                    <YAxis style={{fontSize: 14}} domain={range || ["auto", "auto"]} tickFormatter={axisFormatter}
                           label={isCum ? {value: "Cumulative change", angle: -90, position: "left"} : undefined}/>
                    <Legend wrapperStyle={{fontSize: 14}} iconType="circle" content={({payload}) => {
                        const isSpecial = !school && isTwoFields;
                        const mapContents = isSpecial ? [fields[0], fields[1], ...new Set(payload.map(d => d.dataKey.split(":")[0]))] : payload;

                        return (
                            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 16}}>
                                {mapContents.map((line, i) => (
                                    <div style={{display: "flex", alignItems: "center", marginRight: 16}}>
                                        <svg viewBox="0 0 20 20" width={20} height={20}>
                                            {isSpecial ? (
                                                <React.Fragment>
                                                    {i < 2 ? (
                                                        <path d="M 0 10 L 20 10" stroke="black"
                                                              strokeWidth={2}
                                                              strokeDasharray={i === 0 ? "3 0" : "3 3"}/>
                                                    ) : (
                                                        <circle cx={10} cy={10} r={6} fill={getColor(line)}/>
                                                    )}
                                                </React.Fragment>
                                            ) : (
                                                <path d="M 0 10 L 20 10" stroke={line.payload.stroke}
                                                      strokeWidth={line.payload.strokeWidth}
                                                      strokeDasharray={line.payload.strokeDasharray}/>
                                            )}
                                        </svg>
                                        <span style={{
                                            marginLeft: 8,
                                            color: isSpecial ? i < 2 ? "black" : getColor(line) : line.payload.stroke,
                                        }}>{isSpecial ? i < 2 ? dataLabels[line] : line : line.dataKey}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    }}/>
                    {isCum ? (
                        <Tooltip wrapperStyle={{fontSize: 14}} content={({label, payload}) => {
                            if (payload.length) {
                                const year = +payload[0].payload.year.substring(5, 9);
                                const thisOldData = oldData.find(d => d.year === year);
                                const prevYear = oldData.find(d => d.year + 1 === year);

                                return (
                                    <div style={{padding: 12, backgroundColor: "white", border: "1px solid #ccc"}}>
                                        <div style={{marginBottom: 8}}><span>{label}</span></div>
                                        <table>
                                            <tr>
                                                <th>School</th>
                                                <th>Cum. change</th>
                                                <th>Value</th>
                                                {showPerYear && prevYear && (
                                                    <th>Year change</th>
                                                )}
                                            </tr>
                                            {payload.map((item, i) => {
                                                const field = (!school && isTwoFields) ?
                                                    Object.keys(dataLabels).find(key => dataLabels[key] === item.name.split(":")[0]) + "/" +
                                                    Object.keys(dataLabels).find(key => dataLabels[key] === item.name.split(": ")[1]) :
                                                    Object.keys(dataLabels).find(key => dataLabels[key] === item.name);
                                                const thisOldValue = thisOldData[field];
                                                const lastYearValue = prevYear && prevYear[field];
                                                const perYearPercentage = prevYear && ((thisOldValue - lastYearValue) / lastYearValue);

                                                return (
                                                    <tr style={{color: (isTwoFields && !school) ? getColor(item.name.split(":")[0]) : getColor(item.name), marginTop: 8}} key={field}>
                                                        <td>{item.name}</td>
                                                        <td>{formatterPercent(item.value.toString())}</td>
                                                        <td>{formatterMoney(thisOldValue)}</td>
                                                        {showPerYear && prevYear && (
                                                            <td>{formatterPercent(perYearPercentage)}</td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </table>
                                    </div>
                                );
                            }

                            return null;
                        }}/>
                    ) : (
                        <Tooltip wrapperStyle={{fontSize: 14}} formatter={formatterMoney}/>
                    )}
                    {Object.keys(data[0]).slice(1).map((field, i) => {
                        const isTwoField = field.includes(":");
                        const stroke = getColor(isTwoField ? field.split(":")[0] : field);
                        const isSecondField = isTwoField && field.split(": ")[1] === dataLabels[fields[1]];
                        const strokeDasharray = (field === "National CPI" || isSecondField) ? "3 3" : (field === "LA County CPI") ? "6 6" : (field === "California CPI") ? "12 12" : "3 0";

                        return (
                            <Line type="monotone" dataKey={field} key={field} strokeWidth={2}
                                  stroke={stroke}
                                  dot={false}
                                  strokeDasharray={strokeDasharray}
                            />
                        )
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}