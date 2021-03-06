$(document).ready(function () {
    console.log("Ready!"); // jquery/javascript test connection
    /*******************************************************Chart.js Test ***************************************************************/
    var randomScalingFactor = function () { //random number generator for the demo
        return Math.round(Math.random() * 100);
    };
    $(".stats-no").empty()
    
    var randomWalk = 0; //randomScalingFactor(); //storing the random numbers as useable global variables
    var randomBike = 0; //randomScalingFactor();
    var randomTransit = 0; //randomScalingFactor();

    $("#stats-no-walk").html(randomWalk); //adding the random numbers to the page
    $("#stats-no-bike").html(randomBike);
    $("#stats-no-transit").html(randomTransit);

    $("#myChart").empty(); //empty the chart to start, in case there is anything in there
    new Chart($("#myChart"), { //create new chart using chart.js
        type: 'polarArea',
        data: {
            labels: ["Walkability", "Bikeability", "Transit"],
            datasets: [
                {
                    label: " % Score relative to other cities ",
                    backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
                    data: [
                        randomWalk,
                        randomBike,
                        randomTransit
                    ],
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: " % Score relative to other cities "
            }
        }
    });

    /*
        function addData(chart, label, data) { //function that is used to add data to the chart when it becomes applicable
            chart.data.labels.push(label);
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(data);
            });
            chart.update();
        }
     
        function removeData(chart) { //function that is used to remove data from the chart when it becomes applicable
            chart.data.labels.pop();
            chart.data.datasets.forEach((dataset) => {
                dataset.data.pop();
            });
            chart.update();
        }
        */

    /********************************************************Google Geocoder************************************************************ */
    var map;
    var geocoder; // global variable
    google.maps.event.addDomListener(window, 'load', initialize);

    function initialize() { //geocoder with connection to a map to be added in the near future
        geocoder = new google.maps.Geocoder();
        var mapOptions = {
            center: { lat: 42.066667, lng: -71.293056 },
            zoom: 6,
            mapTypeId: 'roadmap',
            scrollwheel: true
        };
        map = new google.maps.Map(document.querySelector('#map'),
            mapOptions);
    }

    // grab the search phrase from the input box
    var button = document.querySelector("#addressBtn");
    button.onclick = function () {
        //event.preventDefault();
        var pulledAddress = $('#address').val();
        $("#error1").html(""); //clears out the error message
        if (pulledAddress.length < 1) {
            $('#error').after('<p id="error1">This field is required</p>');
        } else {
            var regEx = /^[A-Z0-9][A-Z0-9._%+-]{0,63}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/;
            var validAddress = regEx.test(address);
            if (!validAddress) {
                $('#error').after('<p id="error1">Please Enter a Valid Address</p>');
            }
        }

        var locName = document.querySelector("#address").value;
        findLocation(locName);
    }

    // Function that invokes the "geocode" method and sets
    function findLocation(aName) {
        geocoder.geocode({ 'address': aName },
            function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log("found location: " + aName, results[0].geometry.location);
                    console.log(aName);
                    console.log(results);
                    console.log(results[0].geometry.location);
                    console.log(results[0].geometry.location.lat());
                    console.log(results[0].geometry.location.lng());
                    console.log(results[0].address_components[0].long_name);
                    console.log(results[0].address_components[1].long_name);
                    console.log(results[0].address_components[3].long_name);
                    console.log(results[0].address_components[5].short_name);
                    console.log(results[0].address_components[7].short_name);
                    map.setCenter(results[0].geometry.location);
                };

                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                var streetNumber = results[0].address_components[0].long_name;
                var streetName = results[0].address_components[1].long_name;
                var splitStreetName = streetName.split(" "); //splits up the name of the street into an array that can be plugged in to the walkscore API
                var cityName = results[0].address_components[3].long_name;
                var stateName = results[0].address_components[5].short_name;
                var zipCode = results[0].address_components[7].short_name;

                console.log(splitStreetName);
                /*******************************************************Walkscore API ***************************************************** */
                var queryURL = "http://api.walkscore.com/score?format=json&address=" + streetNumber + "%" + splitStreetName[0] + "%20" + splitStreetName[1] + "%20" + cityName + "%20" + stateName + "%20" + zipCode + "&lat=" + lat + "&lon=" + lng + "&transit=1&bike=1&wsapikey=ff4ba6de25e0330999725219145aa77c"

                console.log(queryURL);

                $.ajax({
                    url: queryURL,
                    method: "GET"
                }).then(function (response) {

                    console.log(response);
                    console.log("Walk Score: " + response.walkscore);
                    console.log("Bike Score: " + response.bike.score);
                    console.log("Transit Score: " + response.transit.score);

                    $(".stats-no").empty();
                    $("#stats-no-walk").html(response.walkscore);
                    $("#stats-no-bike").html(response.bike.score);
                    $("#stats-no-transit").html(response.transit.score);

                    $('#myChart').remove();
                    $('.chart-container').append('<canvas id="myChart" width="auto" height="auto"><canvas>');
                    $("#error1").html("");


                    new Chart($("#myChart"), { //adds the Walkscore data to myChart
                        type: 'polarArea',
                        data: {
                            labels: ["Walkability", "Bikeability", "Transit"],
                            datasets: [
                                {
                                    label: " % Score relative to other cities ",
                                    backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                                    data: [
                                        response.walkscore,
                                        response.bike.score,
                                        response.transit.score
                                    ],
                                }
                            ]
                        },
                        options: {
                            title: {
                                display: true,
                                text: " % Score relative to other cities "
                            }
                        }
                    });

                });
            });
    }
});