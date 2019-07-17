"use strict"

$("#coffee-menu").on("click", e => {
    $("#coffee-menu").hide();
    $("#nav").show();
})

$("#arrow-close").on("click", e => {
    $("#nav").hide();
    $("#coffee-menu").show();
})

let latitude;
let longitude;
let searchDefaultURLFromEventBrite;

function geoFindMe() {
    let options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
    };

    function success(position) {
        latitude  = position.coords.latitude.toFixed(6).toString();
        longitude = position.coords.longitude.toFixed(6).toString(); 
       
        searchDefaultURLFromEventBrite = "https://www.eventbriteapi.com/v3/events/search/?q=hackathons&expand=venue,organizer&location.latitude=" + latitude + "&location.longitude=" + longitude;
    }

    function error() {
        console.log('Unable to retrieve your location')
    }

    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
    } else {
        navigator.geolocation.getCurrentPosition(success, error, options);   
    }
}

$(geoFindMe);


function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => 
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}
        `)
        return queryItems.join("&");
}

function displayResultsFromEventBrite(responseJson) {
    console.log(responseJson);

    $("#js-event-results").empty();

    for (let i = 0; i <= responseJson.events.length; i++) {
        
        if (responseJson.events.length === 0) {
            $("#js-event-results").append(
                `<div style="color: white">
                    <h2>No hackathons found</h2>
                    <i style='font-size:24px' class='far'>&#xf119;</i>
                </div>`
            );
        } else {

            const startDateFromAPI = responseJson.events[i].start.local;       
            const startDate = new Date(startDateFromAPI); 
            const dateAsNiceString1 = startDate.toLocaleString([], {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'});

            let isFree;
            if (responseJson.events[i].is_free) {
                isFree = "Free";
            }  else {
                isFree = `<i class="material-icons" style="color: #EC4D3C; margin-top: -10px">&#xe227;</i>`;
            }

            let venueName;        
            if (responseJson.events[i].venue.name) {
                venueName = responseJson.events[i].venue.name +",";
            } else {
                venueName = "TBA"
            }

            let venueAddressCity;
            if (responseJson.events[i].venue.address.city) {
                venueAddressCity = responseJson.events[i].venue.address.city +",";
            } else {
                venueAddressCity = ""
            }

            let venueAddressRegion;
            if (responseJson.events[i].venue.address.region) {
                venueAddressRegion = responseJson.events[i].venue.address.region;
            } else {            
                venueAddressRegion = ""
            }
            
            let logo;
            if (responseJson.events[i].logo && responseJson.events[i].logo.original && responseJson.events[i].logo.original.url) {            
                logo = responseJson.events[i].logo.original.url;                   
            } else {
                logo = "images/question-mark.png";
            }

                        
            $("#js-event-results").append(
                `<section class="event-card">
                    <a href="${responseJson.events[i].url}">
                        <div class="card">
                            <img src="${logo}" id="js-logo-url">
                            <div class="container">
                                <h2>${responseJson.events[i].name.text}</h2>
                                <div class="inner-container">
                                    <i class="material-icons" style="font-size: 28px">&#xe7f1;</i> 
                                    <h5>${venueName} ${venueAddressCity} ${venueAddressRegion}</h5>
                                    <i class='fa' style="padding-left: 3px">&#xf073;</i>                                                       
                                    <h5 style="padding-left: 38px">${dateAsNiceString1}</h5>                            
                                    <h5 style="color: #EC4D3C">${isFree}</h5>
                                </div>
                            </div>
                        </div>
                    </a>
                </section>`);
        }
    }        
}


      

function displayResultsFromYoutube(responseJson) {
    console.log(responseJson);

    for (let i = 0; i <= responseJson.items.length; i++) {

        // Load the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/player_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
      // Replace the 'ytplayer' element with an <iframe> and
      // YouTube player after the API code downloads.
      var player;
      function onYouTubePlayerAPIReady() {
          player = new YT.Player('ytplayer', {
          height: '360',
          width: '640',
          videoId: responseJson.items[i].videoId        
        });
      }        

        $("#js-youtube-results").append(
            `<iframe id="ytplayer" type="text/html" width="640" height="360"
            src="https://www.youtube.com/embed?" + videoID + "autoplay=1&origin=http://example.com"
            frameborder="0"></iframe>
            `
        )
    }

    //     $("#js-youtube-results").append(
    //         `<section class="event-card">
    //             <a href="">
    //                 <div class="card">                    
    //                     <div class="container">
    //                         <h2>${responseJson.items[i].snippet.title}</h2>
    //                         <div class="inner-container">                                 
    //                             <p>${responseJson.items[i].snippet.description}</p>
    //                             <h5>${responseJson.items[i].snippet.publishedAt}</h5>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </a>
    //         </section>`);
}

function getDefaultEventsFromEventBrite(miles) {
    const options = {
        headers: new Headers({
            Authorization: "Bearer QOAVPXW65GZI6MSN4HL4",             
        })
      };

      const params = {
        "location.within": miles
    }

    const queryString = formatQueryParams(params);
    const url = searchDefaultURLFromEventBrite + "&" + queryString;   

    fetch(url, options)    
        .then(response => {  
            if (response.ok) {                
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsFromEventBrite(responseJson))
        .catch(err => {
            $("#js-error-message").text(`Something went wrong: ${err.message}`);
        });
}

const searchNewInputURLFromEventBrite = "https://www.eventbriteapi.com/v3/events/search/?q=hackathons&expand=venue,organizer";

function getEventsFromEventBrite(query, miles) {
    const options = {
        headers: new Headers({
            Authorization: "Bearer QOAVPXW65GZI6MSN4HL4",                      
        })
      };

    const params = {
        "location.address": query,
        "location.within": miles
    }

    const queryString = formatQueryParams(params);
    const url = searchNewInputURLFromEventBrite + "&" + queryString;    

    fetch(url, options)    
        .then(response => {         
            if (response.ok) {                
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsFromEventBrite(responseJson))
        .catch(err => {
            $("#js-error-message").text(`Something went wrong: ${err.message}`);
        });
}

const searchHackathonVideos = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&order=relevance&q=hackathon&type=video&videoDefinition=high&videoEmbeddable=true&key=AIzaSyD8npOvMraf7uV-1NEeGJMhs6ihtPL6_-0";

function getVideosFromYoutube() {
    // const options = {
    //     headers: new Headers({
    //         Authorization: "Bearer QOAVPXW65GZI6MSN4HL4",                      
    //     })
    //   };

    // const params = {
    //     "location.address": query,
    //     "location.within": miles
    // }

    // const queryString = formatQueryParams(params);
    // const url = searchNewInputURLFromEventBrite + "&" + queryString;    

    fetch(searchHackathonVideos)    
        .then(response => {         
            if (response.ok) {                
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsFromYoutube(responseJson))
        .catch(err => {
            $("#js-error-message").text(`Something went wrong: ${err.message}`);
        });
}

getVideosFromYoutube();

function watchForm() {
    var slider = document.getElementById("js-slider");
    var output = document.getElementById("js-within-value");
    output.innerHTML = slider.value; // Display the default slider value

    slider.oninput = function() {
        output.innerHTML = this.value;
    }

    $("form").submit(e => {
        e.preventDefault(); 
        let searchInput = $("#js-search-input").val();        
        let sliderValue = slider.value+"mi";      

        if (!(searchInput)) {
            getDefaultEventsFromEventBrite(sliderValue);
        } else {
            getEventsFromEventBrite(searchInput, sliderValue);
        }
    })
}

$(watchForm);

  



    


