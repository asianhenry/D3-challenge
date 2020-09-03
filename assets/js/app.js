var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating x-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
	.attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesTextX(circleTextGroup, newXScale,  chosenXAxis) {
        circleTextGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))

  return circleTextGroup;
}

function renderCirclesTextY(circleTextGroup, newYScale, chosenYAxis) {
        circleTextGroup.transition()
            .duration(1000)
            .attr("y", d => newYScale(d[chosenYAxis]))

  return circleTextGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Median Age:";
  }
   else if (chosenXAxis === "income") {
    xlabel = "Household Income:";
  }
  
  var ylabel;
  
  if (chosenYAxis === "obesity") {
    ylabel = "Poverty:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes:";
  }
   else if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Heathcare:";
  }



  var toolTip = d3.tip()
    .attr("class", "d3-tip")
	.style("background", "black")
    .style("color", "white")
    .offset([90, -50])
    .html(function(d) {
		
		if (chosenXAxis === "poverty")	{
			return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);
		}
		else {
		return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
		}
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
	
  })
    //onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data, this)
    });

  return circlesGroup;
};







// Import Data
(async function(){
  var healthData = await d3.csv("assets/data/data.csv").catch(function(error) {
    console.log(error);
  });


    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });
	
    // Step 2: Create scale functions
    // ==============================
	var xLinearScale = xScale(healthData, chosenXAxis);
	var yLinearScale = yScale(healthData, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
   var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
   var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
 


    // Step 5: Create Circles
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "blue")
    .attr("opacity", ".5")
	
	//Add State Abbreviation text to circles
	var circleTextGroup = chartGroup.selectAll()
    .data(healthData)
    .enter()
    .append("text")
    .text(d => d.abbr )
	.style("text-anchor", "middle")
	.style("font-size", "12")
	.attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]));
	

	  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty(%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
	
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for three y-axis labels
   var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
  var obeseLabel = ylabelsGroup.append("text")
	.attr("transform", "rotate(-90)")
    .attr("x", (height/2)+30)
    .attr("y", 0 - (height +60))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity (%)");
	
	
  var smokeLabel = ylabelsGroup.append("text")
	.attr("transform", "rotate(-90)")
    .attr("x", (height/2)+30)
    .attr("y", 0 - (height +40))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
	
  var healthLabel = ylabelsGroup.append("text")
	.attr("transform", "rotate(-90)")
	.attr("transform", "rotate(-90)")
    .attr("x", (height/2)+30)
    .attr("y", 0 - (height+20))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");
	
	
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
	

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);
		

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);
		

        // updates circles with new x values
        circlesGroupX = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
		circleTextGroup = renderCirclesTextX(circleTextGroup, xLinearScale, chosenXAxis)
		

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
		  incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
           povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
		  incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
		
		 else  {
           povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
		  incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
	  });
	  
	  ylabelsGroup.selectAll("text")
      .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis)  {

        // replaces chosenYAxis with value
        chosenYAxis = value;
		
		
		console.log(chosenYAxis)


        // functions here found above csv import
        // updates y scale for new data
		yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
		yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
		circleTextGroup = renderCirclesTextY(circleTextGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
		  obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
		  obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
		
		 else  {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
		  obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        }
	  }
	  
	  
	  
	  
	  
	  
	  
    });



})()
