import React from "react";
import {allData} from "../utils/data.js";
import {ResponsiveContainer, Tooltip, Treemap} from "recharts";

export default function ReTreemap({isExpenses = false, school, year}) {
    const thisSchoolYear = allData[school].find(d => d.year === year);

    if (!thisSchoolYear) return <></>;

    const treeData = Object
        .keys(thisSchoolYear)
        .filter(d => d.substring(0, 3) === (isExpenses ? "exp" : "rev"))
        .map(d => ({
            name: d.substring(4),
            size: thisSchoolYear[d] * (["pomona", "cmc"].includes(school) ? 1000 : 1),
        }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <Treemap data={treeData}>
                <Tooltip/>
            </Treemap>
        </ResponsiveContainer>
    )
}