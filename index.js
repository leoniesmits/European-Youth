
// first, set the margins and with to the svg for later use

var margin = { top: 90, right: 10, bottom: 20, left: 20 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom

// store .append("svg") in variable to keep the code semantic

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// store the different tick formats in variables
// because the change of the Y axis we need this to be dynamic
// set the scales for y and x and store in variables

var formatPercent = d3.format('.0%');
var formatYear = d3.format(',.0f');

var x = d3.scaleLinear()
  .rangeRound([0, width]);

var y = d3.scaleLinear()

// already make the tooltip, as this only has to be done once

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// set the scale for the colors, as the differtent categories
// get different colors
// set the radius with scaleSqrt to have a range in different sizes

var color = d3.scaleOrdinal()
  .domain(["Total", "Males", "Females"])
  .range(["#85a5f1","#F87060","#6EE5B2"])

var radius = d3.scaleSqrt()
  .range([4, 40]);

var xAxis = d3.axisBottom()
  .scale(x)
  .ticks(10, formatPercent);

// set all other things that don't have to be in the function on load
// call the axis's and set the text for the x axis, as this doesn't change later on


svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

var yAxis = d3.axisLeft()
    .scale(x)

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height - 6)
  .text("Percentage thuiswonende jongeren");


// starting with a function to update the data, as the file is too big for the chart
// correctyear corresponds with an eventlistener on the select of the year
// by giving the value of selected element as parameter, it's usable in this function
// load the csv file and refer to 2 functions, one to load and one to get the chart elements right

function update(correctYear) {
  d3.csv("all.data.1.csv", type, onload)

  function onload(error, data) {
  if (error) throw error

// might be sloppy, but I delete all elements that would otherwise appear double
// then, I sort the data later loaded in the radius, so that the smaller circles appear on top
// which is convienent for the tooltip

  d3.selectAll(".bubbles").remove();
  d3.selectAll("#dropdown").remove();
  d3.selectAll(".y.label").remove();

  data.sort(function(a, b) { return b.population - a.population })

// filter the data on the year which was selected
// the correctYear parameter (value) now refers to a function that checks
// the year, so that correctyear becomes applicableyear

  data = data.filter(applicableYear);

// use a function to filter the data on all columns that are not acceptable selections
// selection will later be used to refer to the selected value
// but for now will display the selected value when the data is loaded

  var elements = Object.keys(data[0])
    .filter(function(d){
      return ((d != "year") & (d != "geo") & (d != "gender") & (d != "housing") & (d != "population"));
    });
  var selection = elements[0]

// set the domains, the x domain remains static
// the y domain uses the var selection to only load the selected value as data
// set radius domain, also static

  y.domain([0, d3.max(data, function(d) {
    return +d[selection];})])
    .range([height, 0]);

  x.domain(d3.extent(data, function(d) { return d.housing }))
    .range([0, width]);

  radius.domain(d3.extent(data, function(d) { return d.population }))

// within the svg, make a g called bubbles where the circles will be put
// for every circle, give it an individual name
// use a funcion to give the index of the circle to it's class
// set the attributes using the static values 
// for cy, the y axis side of the circles, refer to the selection variable
// make the tooltip as the circle is already selected, use the same way of 
// refering to the selected value as with cy

    svg.append("g")
    .attr("class", "bubbles")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function(d, i) { return "bubble id-" + i})
    .attr("cx", function(d) { 
      return x(d.housing)
    })
    .attr("cy", function(d) {
      return y(+d[selection])
    })
    .attr("r", function(d) {
      return radius(d.population)
    })
    .style("fill", function(d) {
      return color(d.gender)
    })
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);
    tooltip.html(d.geo)
      .style("left", x(d.housing) + 15 + "px")
      .style("top", (y(+d[selection.value]) - radius(d.population)) + 285 + "px")
    })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
    })

// create the dropdown with selectable values
// the options out of this dropdown will determine the y values
// set an eventlistener and in that function, set the y domain agian
// this time with the selected value
// just as the x axis has text, give the y axis text
// that comes from the selected value

  var selector = d3.select(".comparisons")
    .append("select")
    .attr("id", "dropdown")
    .on("change", function(d) {
      selection = document.getElementById("dropdown")

      y.domain([0, d3.max(data, function(d) {
        return +d[selection.value];})])

        svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "start")
          .attr("y", 6)
          .attr("dy", ".75em")
          .text(function(d) {
            return selection.value;
          });

// again, in this function, repeat the creation of bubbles and 
// the setting of yaxis, as this will change with every change
// of the dropdown

      yAxis.scale(y);

      d3.selectAll(".bubble")
        .transition()
        .attr("class", function(d, i) { return "bubble id-" + i})
        .attr("cx", function(d) { 
          return x(d.housing)
        })
        .attr("cy", function(d) {
          return y(+d[selection.value])
        })
        .attr("r", function(d) {
          return radius(d.population)
        })
        .style("fill", function(d) {
          return color(d.gender)
        })
        .select("title")
        .text(function(d) {
          return d.geo + " : " + d[selection.value];
        })
        .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(d.geo)
          .style("left", x(d.housing) + 15 + "px")
          .style("top", (y(+d[selection.value]) - radius(d.population)) + 150 + "px")
        })
        .on("mouseout", function(d) {
          tooltip.style("opacity", 0);
        })

      d3.selectAll("g.y.axis")
        .call(yAxis)
    })

// finally, create the options and put the names from the
// columns that are selectable as the text and as the values
// so that both js and the user can read them

  selector.selectAll(".option")
    .data(elements)
    .enter().append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d){
      return d
    })

// come back to the function that checks the year of the dataset
// and the selected year

  function applicableYear(d) {
     return d.year == correctYear;
  }

  }
};

// a delay, that was supposed to work but didn't

function delay(d, i) {
  return i * 10;
}

// as the type function is outside of the onload function
// and this is where section with value is called
// make another function to correspond with the selected data

function current(d) {
  return d[selection]
}

// the type function sets the ratio and relationship of the
// domain values

function type (d) {
  d.housing = +d.housing
  current = +current
  d.population = +d.population

  return d
}

// the eventlistener for the loading and filtering of data before
// making the chart
// get the selected value and pass this on as a parameter to the 
// function that starts the code


var select = d3.selectAll(".yearSection")
  select.on("change", function() {
    update(this.value)
  })

// call the value off the (in html) selected option and
// send this to the function so it works already without interaction

update(2013)


