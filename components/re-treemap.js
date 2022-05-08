import React from "react";
import {allData} from "../utils/data.js";
import {ResponsiveContainer, Tooltip, Treemap} from "recharts";

export default function ReTreemap({isExpenses = false, school = "pomona", year = 2020}) {
    const thisSchoolYear = allData[school].find(d => d.year === year);

    if (!thisSchoolYear) return <></>;

    const treeData = Object
        .keys(thisSchoolYear)
        .filter(d => d.substring(0, 3) === (isExpenses ? "exp" : "rev"))
        .map(d => ({
            name: d.substring(4),
            value: thisSchoolYear[d],
        }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <Treemap data={treeData} ratio={1} isAnimationActive={false} aspectRatio={1} width={600} height={600}>
                <Tooltip content={({payload}) => payload.length ?
                    <p>{payload[0].payload.name}: {payload[0].payload.value}</p> : null}/>
            </Treemap>
        </ResponsiveContainer>
    )
}