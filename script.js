// Set up dimensions and margins
const margin = {top: 20, right: 30, bottom: 50, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append SVG to the body
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define scales and axes
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// Load data and create chart
/*d3.csv("data.csv").then(function(data) {
    // Parse the date and value
    const parseDate = d3.timeParse("%Y-%m");
    const formatDate = d3.timeFormat("%b %Y");*/

// Load data from the provided URL
const dataUrl = "https://raw.githubusercontent.com/bhorwitz-ahd/Test/aeaa26fc51c7e2023afcc909d973f8ae5518897a/data.csv";


d3.csv(dataUrl).then(function(data) {
    // Parse the date and value
    const parseDate = d3.timeParse("%Y-%m");

    data.forEach(d => {
        d.date = parseDate(d.year + "-" + d.month);
        d.year = +d.year; // Parse year as number
        d.value = +d.value;
    });

    // Sort data by date
    data.sort((a, b) => a.date - b.date);

    // Create unique options for filters
    const agencies = [...new Set(data.map(d => d.agency))];
    const crimes = [...new Set(data.map(d => d.crime))];
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    d3.select("#agency-filter")
      .selectAll("option")
      .data(agencies)
      .enter().append("option")
      .text(d => d);

    d3.select("#crime-filter")
      .selectAll("option")
      .data(crimes)
      .enter().append("option")
      .text(d => d);

      d3.select("#year-filter")
      .selectAll("option")
      .data(["all", ...years])
      .enter().append("option")
      .attr("value", d => d)
      .text(d => d === "all" ? "All Years" : d);

    function updateGraph() {
        const selectedAgency = d3.select("#agency-filter").property("value");
        const selectedCrime = d3.select("#crime-filter").property("value");
        const selectedYear = d3.select("#year-filter").property("value");

        const filteredData = data.filter(d => 
            (selectedAgency === "" || d.agency === selectedAgency) &&
            (selectedCrime === "" || d.crime === selectedCrime) &&
            (selectedYear === "all" || d.year === +selectedYear) // Handle 'all' year option
        );

        // Update the scales
        x.domain(d3.extent(filteredData, d => d.date));
        y.domain([0, d3.max(filteredData, d => d.value)]);

        // Define the line with smooth interpolation
        const line = d3.line()
            .curve(d3.curveBasis)  // Use curveBasis for smooth lines
            .x(d => x(d.date))
            .y(d => y(d.value));

        svg.selectAll("*").remove(); // Clear previous content

        svg.append("path")
            .data([filteredData])
            .attr("class", "line")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "steelblue")
            .style("stroke-width", "2px");

            svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Add x-axis label
        svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + 15 + (margin.bottom / 2))
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", `translate(${-margin.left / 2},${height / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text("Crime Count");
    }



    // Initial render
    updateGraph();

    // Update graph on filter change
    d3.select("#agency-filter").on("change", updateGraph);
    d3.select("#crime-filter").on("change", updateGraph);
    d3.select("#year-filter").on("change", updateGraph);
});
