export default function calculateChange(arr, excludedFields) {
    return arr.map((d, i) => {
        let retval = {};
        for (let field of excludedFields) {
            retval[field] = d[field];
        }
        for (let field of Object.keys(d).filter(x => !excludedFields.includes(x))) {
            if (i === 0) {
                retval[field + "_cum"] = 0;
                retval[field + "_change"] = 0;
            } else {
                // if prev field defined, calculate change
                if (!isNullOrUndefined(arr[i - 1][field]) && !isNullOrUndefined(d[field])) {
                    const prevVal = arr[i - 1][field];
                    const currVal = d[field];
                    retval[field + "_change"] = (currVal - prevVal) / prevVal;
                } else {
                    retval[field + "_change"] = null;
                }

                // if first field defined, calculate cum change
                if (!isNullOrUndefined(arr[0][field]) && !isNullOrUndefined(d[field])) {
                    const prevVal = arr[0][field];
                    const currVal = d[field];
                    retval[field + "_cum"] = (currVal - prevVal) / prevVal;
                } else {
                    retval[field + "_cum"] = null;
                }
            }
        }

        return retval;
    })
}

const isNullOrUndefined = d => d === null || d === undefined || d === "";