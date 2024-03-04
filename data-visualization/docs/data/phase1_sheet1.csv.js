import {csvParse, csvFormat} from "d3-dsv";

// Get CSV
const response = await fetch("./data/phase1_sheet1.csv");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const proposals = response.text();

// Create a Map from raw proposal data to a basic (JSON) hierarchy
const proposalMap = csvParse(proposals, (d) => {
    return {
        year: new Date(+d.Year, 0, 1), // lowercase and convert "Year" to Date
        make: d.Make, // lowercase
        model: d.Model, // lowercase
        length: +d.Length // lowercase and convert "Length" to number
    };
});

// Output csv
process.stdout.write(csvFormat(proposalMap));