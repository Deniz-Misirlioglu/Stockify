var URL = "https://api.polygon.io/";

var yyyy = 0;

let mm = 0;
let dd = 0;

let ym = 0;
let yd = 0;

let rm = 0;
var rd = 0;

var formattedToday = 0;
var formattedYesterday = 0;
var formattedRange = 0;
var currdate = 0;


calculateDate();


//MAIN GLOBAL VARIABLES USED
var queryType;
var ticker;
var dataObjects = [];


//This function formats dates in 3 different variables, Today, Yesterday, Range, and Current Date
//The range is used to accumulale the correct day to produce 7 days worth of aggregate bars
function calculateDate() {
    const today = new Date();
    yyyy = today.getFullYear();
    mm = today.getMonth() + 1;
    dd = today.getDate();
    const previousDay = new Date();

    if (previousDay.getDay() === 0) {
        previousDay.setDate(previousDay.getDate() - 2);
    }
    else if (previousDay.getDay() === 1) {
        previousDay.setDate(previousDay.getDate() - 3);
    }

    else if (previousDay.getDay() > 1 && previousDay.getDay() < 6) {
        previousDay.setDate(previousDay.getDate() - 1);
    }
    ym = previousDay.getMonth() + 1;
    yd = previousDay.getDate();


    const range = new Date();
    range.setDate(range.getDate() - 11);
    rm = range.getMonth() + 1;
    rd = range.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    if (yd < 10) yd = '0' + yd;
    if (ym < 10) ym = '0' + ym;

    if (rd < 10) rd = '0' + rd;
    if (rm < 10) rm = '0' + rm;

    formattedToday = mm + '/' + dd + '/' + yyyy;
    formattedYesterday = ym + '/' + yd + '/' + yyyy;
    formattedRange = rm + '/' + rd + '/' + yyyy;
    console.log(formattedYesterday);

    currdate = yyyy + "-" + mm + "-" + (dd - 3);
}


//Document.ready to place the exchanges after the document has loaded.
$(document).ready(function () {

    //Attaching the onclick functions using ajax
    $('#left-arrow1').attr('onClick', 'onRight();');
    $('#right-arrow1').attr('onClick', 'onLeft();');
    $('.infoClick').attr('onClick', 'infoPress();');
    $('.getNewsClick').attr('onClick', 'getNewsDetails();');
    $('#right-arrow1').attr('onClick', 'onLeft();');
    $('.getstockDataB').attr('onClick', 'getStock();');

    //Hiding divs necessary to produce my webpage
    $("#descrip3").hide();
    $("#descrip4").hide();
    $("#entireData").hide();
    $("#entireData2").hide();
    $("#prev").hide();
    $("#entireNews").hide();
    $("#stockInfo").hide();
    $("#fullHistory1").hide();
    $("#description2").hide();
    $("#entireNews1").hide();
    getExchanges();

    //The function to get the exchanges from Polygon.io
    function getExchanges() {

        a = $.ajax({
            url: URL + 'v3/reference/exchanges?asset_class=stocks&apiKey=jYQ0fcgoOiYupzF5lS7atLXFO7mAi4XM',
            method: "GET"
        }).done(function (data) {
            console.log(data);
            var length = data.results.length;
            for (i = 0; i < length; i++) {
                $('#stock-exchanges').append('<option value="' + data.results[i].operating_mic + '">' + data.results[i].name + '</option>');

            }
        }).fail(function (error) {
            console.log("Failed to retrieve the stock exchange");
        });
    }


    //The function to get the stock tickers on a given exchange, when the exchanges dropdown gets selected.
    //This function appends to the drop down box by adding the values of the ticker
    $("#stock-exchanges").on("change", function () {
        // Clear the stocks dropdown
        $("#stocks").empty().append('<option value="">Select a Stock</option>');

        // Retrieve the selected exchange
        var exchange = $('#stock-exchanges').val();
        console.log(exchange);
        if (exchange) {
            // Make an AJAX request to the Polygon API to retrieve the list of stocks for the selected exchange
            b = $.ajax({
                url: URL + "v3/reference/tickers?market=stocks&exchange=" + exchange + "&limit=1000&active=true&apiKey=jYQ0fcgoOiYupzF5lS7atLXFO7mAi4XM",
                method: "GET"
            }).done(function (data) {
                console.log(data);

                var length = data.results.length;
                if (length > 0)
                    for (var i = 0; i < length; i++)
                        $('#stocks').append('<option value="' + data.results[i].ticker + '">' + data.results[i].ticker + '</option>');

                else
                    $('#stocks').html('<option value="">' + "No Stocks Available" + '</option>');
            }).fail(function (error) {
                console.log("Failed to retrieve the stock exchange");
            });
        }
    });



});

// This function is an api call which gets the aggregate bars over the range of 7 days
// In this function I also call stock description which also calls the ticker details for a specific stock
// This function also calls the table formats which formats the graph, and table for the previous data
// This function also calls setStock, which sets the data inside of the database
function getTickerDetails() {
    $("#entireData").show();
    $("#entireNews").hide();
    ticker = $('#stocks').val();
    a = $.ajax({ //
        url: URL + "v2/aggs/ticker/" + ticker + "/range/1/day/" + yyyy + "-" + rm + "-" + rd + "/" + yyyy + "-" + mm + "-" + dd + "?adjusted=true&sort=asc&limit=120&apiKey=jYQ0fcgoOiYupzF5lS7atLXFO7mAi4XM",
        method: "GET"
    }).done(function (data) {
        queryType = "detail";

        dataObjects[0] = (data.results);

        //Places the stock description div and fills it with data
        stockDescrption();

        //Fills the div with all stock data
        recentDataFormat(data, ticker);

        //Fills the table with data from the last 6 days of the stock
        prevTableFormat(data, ticker);


        var delay = 2000; //1 second

        //TIMEOUT USED BECAUSE AJAX call was out of sync with placing the items in the JSON array
        setTimeout(function () {
            setStock();
        }, delay);


    }).fail(function (error) {
        //Logging error
        console.log("Failed to retrieve the ticker exchange");
        alert("To many requests, please wait a minute");
    });
}

//This function hides a div for the description and shows another div
function onLeft() {

    $("#description1").hide();

    $("#description2").show();
}
//This function hides a div for the description and shows another div
function onRight() {
    $("#description2").hide();

    $("#description1").show();
}

// This function is used to get the description for a stock with the ticker details,
// This function appends to a div with the all of the descriptions about a stock
function stockDescrption() {
    var ticker = $('#stocks').val();
    a = $.ajax({ //
        url: URL + "v3/reference/tickers/" + ticker + "?apiKey=jYQ0fcgoOiYupzF5lS7atLXFO7mAi4XM",
        method: "GET"
    }).done(function (data) {
        $("#stockInfo").show();
        dataObjects[1] = (data.results);
        console.log(data.results);
        $("#description1").empty().append(data.results.description);
        if (data.results.description === undefined)
            $("#description1").empty().append("No Description for this Stock");

        //USING ternary operators incase the value is undefined, and replacing it with N/A
        $("#description2").empty().append("<div class='bold1'>Currency: <p id='small'>" + (data.results.currency_name ? data.results.currency_name.toUpperCase() : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Location: <p id='small'>" + (data.results.locale ? data.results.locale.toUpperCase() : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Name: <p id='small'>" + (data.results.name ? data.results.name : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Round Lot: <p id='small'>" + (data.results.round_lot ? data.results.round_lot : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Outstanding Shares: <p id='small'>" + (data.results.share_class_shares_outstanding ? data.results.share_class_shares_outstanding.toLocaleString("en-US") : "N/A") + "</div>");
        $("#description2").append("<div class='bold1'>List Date: <p id='small'>" + (data.results.list_date ? data.results.list_date : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Total Employees: <p id='small'>" + (data.results.total_employees ? data.results.total_employees.toLocaleString("en-US") : "N/A") + "</p></div>");
        $("#description2").append("<div class='bold1'>Type: <p id='small'>" + (data.results.type ? data.results.type : "N/A") + "</p></div>");


    }).fail(function (error) {
        console.log("Failed to retrieve the stock exchange");
        alert("To many requests, please wait a minute");
    });

}

// This function gets the first 10 news about a stock
// This functin calls the setStock function to place the recieved data in the database
function getNewsDetails() {
    ticker = $("#stocks").val();
    stockDescrption();
    $("#entireNews").show();
    $("#entireData").hide();
    $("#currNews").html(ticker);

    //News Calling API
    a = $.ajax({ //
        url: URL + "v2/reference/news?ticker=" + ticker + "&apiKey=jYQ0fcgoOiYupzF5lS7atLXFO7mAi4XM",
        method: "GET"
    }).done(function (data) {
        console.log(data);
        queryType = "news";

        //PUSHING NEWS TO the database
        dataObjects[0] = (data.results);
        delay = 2000;

        //Console log because of async problems
        setTimeout(function () {
            //your code to be executed after 1 second
            setStock();
        }, delay);
        $(comp).html(img);

        //Emptying out the news div
        for (var i = 0; i < 10; i++) {
            var comp = "#complogo" + i;
            var news = "#firstNews" + i;
            var author = "#author" + i;
            var authdate = "#date" + i;
            var desc = "#desc" + i;
            var prev = "#prev" + (i + 1);
            $(comp).empty();
            $(news).empty();
            $(author).empty();
            $(authdate).empty();
            $(desc).empty();
            $(prev).hide();
        }

        //Filling in the news div with articles and data
        for (var i = 0; i < data.results.length; i++) {

            var img = $("<img src=" + data.results[i].publisher.logo_url + ">");

            img.width(100);
            img.height(100);

            var link = $("<a>");
            link.attr('href', data.results[i].article_url);
            link.text(data.results[i].title);

            const dateString = data.results[i].published_utc;
            const date = dateString.substring(0, 10);

            var prev = "#prev" + (i + 1);
            var comp = "#complogo" + i;
            var news = "#firstNews" + i;
            var author = "#author" + i;
            var authdate = "#date" + i;
            var desc = "#desc" + i;

            if (i === 2)
                desc = "#descTwo"

            console.log(data.results[i].description);
            $(prev).show();

            $(comp).html(img);
            $(news).html(link);
            $(author).html("Author: <p class ='small1'>" + data.results[i].author + "</p>");
            $(authdate).html("Date: <p class ='small1'>" + date + "</p>");
            $(desc).html("Description: <p class ='small1'>" + data.results[i].description + "</p>");
        }
        console.log(data.results.length)
        if (data.results.length === 0) {
            $("#prev1").show();
            $("#author0").html("No News for the given Stock");
        }

    }).fail(function (error) {
        console.log("Failed to retrieve the news for the stock");

        alert("TO many API requests, please wait a minute");
    });



}
// This function displays the news on the history page by calling the phplite getStock method with a given date
function databaseNews(data, ticker1) {
    $("#currNews").html(ticker1);
    console.log(data);
    //$(comp).html(img);

    //Emptying out the div of Stock News
    for (var i = 0; i < 10; i++) {
        var comp = "#complogo" + i;
        var news = "#firstNews" + i;
        var author = "#author" + i;
        var authdate = "#date" + i;
        var desc = "#desc" + i;
        var prev = "#prev" + (i + 1);
        $(comp).empty();
        $(news).empty();
        $(author).empty();
        $(authdate).empty();
        $(desc).empty();
        $(prev).hide();
    }

    //FIlling in the div with stock news
    for (var i = 0; i < data.length; i++) {

        var link = $("<a>");
        var img = $("<img src=" + data[i].publisher.logo_url + ">");
        img.attr('src', data[i].publisher.logo_url);
        img.width(100);
        img.height(100);

        link.attr('href', data[i].article_url);
        link.text(data[i].title);

        const dateString = data[i].published_utc;
        const date = dateString.substring(0, 10);

        var prev = "#prev" + (i + 1);
        var comp = "#complogo" + i;
        var news = "#firstNews" + i;
        var author = "#author" + i;
        var authdate = "#date" + i;
        var desc = "#desc" + i;

        //DIV id issues, same id as another
        if (i === 2)
            desc = "#descTwo"

        $(prev).show();
        $(comp).html(img);
        $(news).html(link);
        $(author).html("Author: <p class ='small1'>" + data[i].author + "</p>");
        $(authdate).html("Date: <p class ='small1'>" + date + "</p>");
        $(desc).html("Description: <p class ='small1'>" + data[i].description + "</p>");
    }
    console.log(data.length)
    if (data.length === 0) {
        $("#prev1").show();
        $("#author0").html("No News for the given Stock");
    }

}

function infoPress() {
    getTickerDetails();
}

// In this fucnction, it formats the table for the stock data inside of the stock page
// This function also calls the recent graph method which displays the graphs on the page
function prevTableFormat(data, ticker) {
    $("#prev").show();
    var arrayClose = [];
    var arrayCloseDate = [];
    var arrayOpen = [];
    for (var i = 0; i < data.results.length - 1; i++) {
        const unixTimestamp = data.results[i].t; // Unix timestamp in milliseconds

        const date = new Date(unixTimestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        //FORMATTING THE DATA BASED ON THE UNIX TIMESTAMP
        const formattedDate = month + "/" + day + "/" + year;

        const divHolder = "#prevTable" + (i + 1);
        const openPrice = "#prevTable" + i + i;
        const closePrice = "#prevTable" + i + i + i;
        console.log(openPrice)

        //Pushing the data to an array so the helper function can format it in a graph
        $(divHolder).html(formattedDate);
        $(openPrice).html(data.results[i].o + "$");
        $(closePrice).html(data.results[i].c + "$");
        arrayClose.push(data.results[i].c);
        arrayCloseDate.push(formattedDate);
        arrayOpen.push(data.results[i].o);
    }
    //Formating the previously gathered array into a graph
    recentGraph(arrayClose, arrayOpen, arrayCloseDate, ticker);
}

// THis function is used to format the table for the history page given the data from the database
// This function also calls the recent graph function which displays and formats the graph
function prevTableFormat2(data, ticker) {
    $("#prev").show();
    var arrayClose = [];
    var arrayCloseDate = [];
    var arrayOpen = [];
    for (var i = 0; i < data.length - 1; i++) {
        const unixTimestamp = data[i].t;
        const date = new Date(unixTimestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        const formattedDate = month + "/" + day + "/" + year;

        const divHolder = "#prevTable" + (i + 1);
        const openPrice = "#prevTable" + i + i;
        const closePrice = "#prevTable" + i + i + i;
        console.log(openPrice)


        $(divHolder).html(formattedDate);
        $(openPrice).html(data[i].o + "$");
        $(closePrice).html(data[i].c + "$");
        arrayClose.push(data[i].c);
        arrayCloseDate.push(formattedDate);
        arrayOpen.push(data[i].o);
    }
    recentGraph(arrayClose, arrayOpen, arrayCloseDate, ticker);
}

// This function takes in data to display a line graph on the opening and closing prices of a linegraph
//This graph should only display 2 lines, the green line is the opening prices, and the red line is the closing prices
function recentGraph(data, data2, arrayCloseDates, ticker) {

    const ctx = $('#recentGraph').get(0).getContext('2d');
    var chartData = {
        labels: arrayCloseDates,
        datasets: [{
            label: "Closing Price",
            data: data,
            fill: false,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.1
        }, {
            label: "Open Price",
            data: data2,
            fill: false,
            borderColor: "rgb(99, 255, 132)",
            tension: 0.1
        }
        ]
    };

    var chartOptions = {
        scales: {
            yAxes: [{
                ticks: {
                }
            }]
        }
    };

    var myChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// This function  takes in data and formats the data for the stock page displaying the high, low, open, and close price
//This function also does calcualtions on the % change of the stock, and displays it in a bar graph
function recentDataFormat(data, ticker) {

    console.log(data);
    const myJSON = JSON.stringify(data);

    const prevDay = data.results.length - 1;
    const unixTimestamp = data.results[prevDay].t;
    const date = new Date(unixTimestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const formattedDate = month + "/" + day + "/" + year;
    $('#date').html(formattedDate);

    //Calculating the percentages for the change in the market
    highchange = ((data.results[prevDay].h - data.results[prevDay].o) / data.results[prevDay].h) * 100;
    lowchange = ((data.results[prevDay].l - data.results[prevDay].o) / data.results[prevDay].l) * 100;
    dailychange = ((data.results[prevDay].c - data.results[prevDay].o) / data.results[prevDay].c) * 100;

    // ALL APPENDS

    $('#curr').empty().append(ticker);
    $('#currency').empty().append(data.results[prevDay].o + "$");
    $('#high').empty().append(data.results[prevDay].h.toFixed(2) + "$");
    $('#low').empty().append(data.results[prevDay].l.toFixed(2) + "$");
    $('#close').empty().append(data.results[prevDay].c + "$");
    $('#volume').empty().append(data.results[prevDay].v.toLocaleString("en-US"));

    $('#highchange').empty().append(highchange.toFixed(2) + "%");
    $('#lowchange').empty().append(lowchange.toFixed(2) + "%");
    $('#dailychange').empty().append(dailychange.toFixed(2) + "%");

    $("#dailychange").removeClass();
    $("#lowchange").removeClass();
    $("#highchange").removeClass();

    //Adding the colors to the text if the change was a positive or a negative change
    if (dailychange > 0)
        $('#dailychange').addClass("green");
    else
        $('#dailychange').addClass("red");

    if (lowchange > 0)
        $('#lowchange').addClass("green");
    else
        $('#lowchange').addClass("red");

    if (highchange > 0)
        $('#highchange').addClass("green");
    else
        $('#highchange').addClass("red");

    const ctx = $('#cnva').get(0).getContext('2d');

    const o = data.results[prevDay].o;
    const c = data.results[prevDay].c;
    const l = data.results[prevDay].l;
    const h = data.results[prevDay].h;
    const vw = data.results[prevDay].vw;

    // Creatnig the bar chart to display data on the previous close data
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Aggregate Bars For Most Recent Day"],
            datasets: [{
                label: "Volume Weight AVG price",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: [vw]
            }, {
                label: "Open",
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                data: [o]
            }, {
                label: "Close",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                data: [c]
            }, {
                label: "High",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                data: [h]
            }, {
                label: "Low",
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                data: [l]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });


}

// This function is a copy of the previous function for data which from the database rather than an api call
function recentDataFormat2(data, ticker) {

    console.log(data);

    const prevDay = data.length - 1;
    const unixTimestamp = data[prevDay].t;
    const date = new Date(unixTimestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const formattedDate = month + "/" + day + "/" + year;
    $('#date').html(formattedDate);
    highchange = ((data[prevDay].h - data[prevDay].o) / data[prevDay].h) * 100;
    lowchange = ((data[prevDay].l - data[prevDay].o) / data[prevDay].l) * 100;
    dailychange = ((data[prevDay].c - data[prevDay].o) / data[prevDay].c) * 100;


    //ALL APPENDS TO THE DIV
    $('#curr').empty().append(ticker);
    $('#currency').empty().append(data[prevDay].o + "$");
    $('#high').empty().append(data[prevDay].h.toFixed(2) + "$");
    $('#low').empty().append(data[prevDay].l.toFixed(2) + "$");
    $('#close').empty().append(data[prevDay].c + "$");
    $('#volume').empty().append(data[prevDay].v.toLocaleString("en-US"));

    $('#highchange').empty().append(highchange.toFixed(2) + "%");
    $('#lowchange').empty().append(lowchange.toFixed(2) + "%");
    $('#dailychange').empty().append(dailychange.toFixed(2) + "%");

    $("#dailychange").removeClass();
    $("#lowchange").removeClass();
    $("#highchange").removeClass();

    console.log("IT SHOULD BE GREEN");
    if (dailychange > 0) {
        $('#dailychange').addClass("green");
    }
    else
        $('#dailychange').addClass("red");

    if (lowchange > 0)
        $('#lowchange').addClass("green");
    else
        $('#lowchange').addClass("red");

    if (highchange > 0)
        $('#highchange').addClass("green");
    else
        $('#highchange').addClass("red");

    const ctx = $('#cnva').get(0).getContext('2d');

    const o = data[prevDay].o;
    const c = data[prevDay].c;
    const l = data[prevDay].l;
    const h = data[prevDay].h;
    const vw = data[prevDay].vw;

    //Creating a chart on the previous data in a bar graph format
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Aggregate Bars For Most Recent Day"],
            datasets: [{
                label: "Volume Weight AVG price",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: [vw]
            }, {
                label: "Open",
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                data: [o]
            }, {
                label: "Close",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                data: [c]
            }, {
                label: "High",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                data: [h]
            }, {
                label: "Low",
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                data: [l]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });


}

// This function is used to place the stock, and its data inside of the database
// THis function uses an ajax call with the php file setStock() method
function setStock() {
    $.ajax({
        type: "POST",
        url: "http://172.17.15.80/cse383_final/final.php",
        data: {
            method: 'setStock',
            stockTicker: ticker,
            queryType: queryType,
            jsonData: JSON.stringify(dataObjects)
        },
        success: function (response) {
            console.log("THIS DATA OBJECTS /n")
            console.log(dataObjects);
            dataObjects = [];
        },
        error: function () {
            console.log('error');
        }
    });
}

// This function is used to get a reponse from the data base given a specific date
// This fnction calls the getStock() function from the php file and displays the div describing the stock, type, and button
function getStock() {
    var now = new Date();
    var offset = now.getTimezoneOffset();
    console.log(offset); // Output:

    var dateValue = $('#calDate').val();
    $("#fullHistory1").show();
    var dateObj = new Date(dateValue);
    yyyy = dateObj.getFullYear();
    mm = dateObj.getMonth() + 1;
    dd = dateObj.getDate() + 1;
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm

    var fullDate = yyyy + "-" + mm + "-" + dd;
    console.log(fullDate)
    $.ajax({
        type: "POST",
        url: "http://172.17.15.80/cse383_final/final.php",
        data: {
            method: 'getStock',
            date: fullDate
        },
        success: function (response) {

            var table = $('#table2');
            var slid = $("#slider").val();
            var ticker1;
            console.log(response)
            console.log("THIS RESPONSE")
            // Create a new row and add cells to it
            $('#table2').children().not('thead').remove();

            if (response.result.length < slid)
                slid = response.result.length;

            for (var i = 0; i < slid; i++) {
                var newRow = $('<tr>');
                newRow.append($('<td>').text(response.result[i].stockTicker));
                newRow.append($('<td>').text(response.result[i].dateTime));
                newRow.append($('<td>').text(response.result[i].queryType));

                //Creating the button so the user is able to choose this specific stock
                newRow.append($('<td>').append($('<input type="button" value="Show" id="button' + i + '">')));
                newRow.append($('</tr>'));
                table.append(newRow);
                queryTyp = response.result[i].queryType;
                ticker1 = response.result[i].stockTicker;
                var resu = response.result[i];
                var button = $("#button" + i);

                //Button onclick function for the given data, THIS KEEPS THE DATA AT THE CURRENT ITERATION AND STATES IT IN THE FUNCTION
                button.click((function (resu, ticker1, queryTyp) { //Immediadetly Invoked Function Expression (Closure Function)
                    return function () {                           //Creates a new scope and immedietly executes it with the given variables


                        if (queryTyp === "detail") { //Displaying the details if the query type is detail
                            $("#entireNews1").hide();
                            $("#entireData2").show();
                            var jsonOBJ = JSON.parse(resu.jsonData);
                            recentDataFormat2(jsonOBJ[0], ticker1);
                            prevTableFormat2(jsonOBJ[0], ticker1);
                            historyStockDescription(jsonOBJ[1], 3)
                        }
                        if (queryTyp === "news") {  //Displaying the news if the query type is news
                            $("#entireData2").hide();
                            $("#entireNews1").show();
                            var jsonOBJ = JSON.parse(resu.jsonData);
                            databaseNews(jsonOBJ[0], ticker1);
                            historyStockDescription(jsonOBJ[1], 4)
                        }
                    };
                })(resu, ticker1, queryTyp));
            }
        },
        error: function () {
            console.log('error');
        }
    });
}


//This function is used to create the div which is placed in the history page and able to be navigated to by the arrows on the div
//This function takes the stock data ticker data, and the num which is the specific div id it is placed in.
function historyStockDescription(data, num) {

    var place = "#descrip" + num;
    console.log(data.description);
    $(place).empty().append("<div class='bold1'>Description: <p id='small'>" + (data.description ? data.description : "N/A") + "</p></div>");
    if (data.description === undefined)
        $(place).empty().append("No Description for this Stock");

    //CHECKING FOR UNDEFINED VALUES, IF SO N?A
    $(place).append("<div class='bold1'>Currency: <p id='small'>" + (data.currency_name ? data.currency_name.toUpperCase() : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Location: <p id='small'>" + (data.locale ? data.locale.toUpperCase() : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Name: <p id='small'>" + (data.name ? data.name : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Round Lot: <p id='small'>" + (data.round_lot ? data.round_lot : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Outstanding Shares: <p id='small'>" + (data.share_class_shares_outstanding ? data.share_class_shares_outstanding.toLocaleString("en-US") : "N/A") + "</div>");
    $(place).append("<div class='bold1'>List Date: <p id='small'>" + (data.list_date ? data.list_date : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Total Employees: <p id='small'>" + (data.total_employees ? data.total_employees.toLocaleString("en-US") : "N/A") + "</p></div>");
    $(place).append("<div class='bold1'>Type: <p id='small'>" + (data.type ? data.type : "N/A") + "</p></div>");

}


// These functions show and hide using the arrows on top of the div in the history page
function showDes() {
    $("#fullData").hide();
    $("#descrip3").show();
}

function showData() {
    $("#fullData").show();
    $("#descrip3").hide();
}

function showNews() {
    $("#newsnews").show();
    $("#descrip4").hide();
}

function showDes2() {
    $("#newsnews").hide();
    $("#descrip4").show();
}