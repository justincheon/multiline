
//sets margins for the four sides of the chart, clockwise from top
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse; //parse the year

//Constructs a new time scale with the default domain and range; the ticks and tick format are configured for local time.
var x = d3.time.scale() //encode time along x axis
    .range([0, width]); //returns range of the x axis

var y = d3.scale.linear()
    .range([height, 0]); //returns range of the y axis

var color = d3.scale.category10(); //Constructs a new ordinal scale with a range of ten categorical colors

//define x and y axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line() //display line shape
    .interpolate("basis") //makes the graph lines more smooth
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.energy); });

//adds svg element to the body of the HTML file
var svg = d3.select("body").append("svg")
    //set width of chart
    .attr("width", width + margin.left + margin.right)
    //set height of chart
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    //moves svg element to the correct margins
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
d3.csv("EPC_2000_2010_new.csv", 
    //parse data for each row of the csv file
    function(d) {
        return {
            date: parseDate(d.Year), // convert "Year" column to Date
            Brazil: +d.Brazil,
            China: +d.China,
            India: +d.India,
            Russia: +d.Russia,
            "South Africa": +d.SouthAfrica, //enclose in quotes to read in as one string
            "United States": +d.UnitedStates
        };
    },
    function(error,data) {
        console.log(data);
        //determines colors based on number of countries
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; })); //d3.keys returns country names; compute row or column names
        var countries = color.domain().map(function(name) { //maps the colors to the countries
            return {
                name: name, //country name
                values: data.map(function(d) { //energy for a particular year
                    return {date: d.date, energy: +d[name]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));  //returns min and max value in array to determine values on x axis

        y.domain([  //determine values on y axis
            d3.min(countries, function(c) { return d3.min(c.values, function(v) { return v.energy; }); }),
            d3.max(countries, function(c) { return d3.max(c.values, function(v) { return v.energy; }); })
        ]);
        
        //draw x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")") //position x axis
            .call(xAxis)
        .append("text") //x axis label
            .attr("x",-200)
            .attr("y",-46)
            .text("Year");
        
        //draw y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        .append("text") //y axis label
            .attr("transform", "rotate(-90)")   //rotate y axis label
            .attr("x", -180)
            .attr("y", -46)
            .attr("dy", ".71em")
            .style("text-anchor", "end")    //shift axis labels down
            .text("Million BTUs per person");
        
        svg.append("text")
            
        //"Year" label
        svg.append("text")
            .attr("x", 860)
            .attr("y", 457)
            .text("Year");
        
        //code from http://www.d3noob.org/2013/01/adding-grid-lines-to-d3js-graph.html
        //make gridlines
        //vertical gridlines
        svg.append("g")         
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis
            .tickSize(-height, 0, 0) //-height needed or else it would draw gridlines below the graph
            .tickFormat("")
        );
        
        //horizontal gridlines
        svg.append("g")         
        .attr("class", "grid")
        .call(yAxis
            .tickSize(-width, 0, 0) //-width needed or else it would draw gridlines left of the graph
            .tickFormat("")
        );
        
        var country = svg.selectAll(".country")
            .data(countries) //load country data
            .enter().append("g") //appends countries to variable
            .attr("class", "country");
        
    
        //draw the lines
        country.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); }); //color of the lines
        //.transition().duration(2000)
        
        var path = country.select("path");
        var totalLength = path.node().getTotalLength(); //total length of lines
        
        //code from reference 4
        //puts in transition for lines
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", 0);
        
        //add country labels
        country.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.energy) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
    }
);