// Replace apiKey variable with your own key
const apiKey = key;
const historyContainer = $(".history-container");

// Creates buttons for all cities stored in local storage
function setHistory() {
  // Clear container of previous entries
  historyContainer.empty();

  // Pull data from local storage
  const cityStorage = JSON.parse(localStorage.getItem("cities"));
  if (!cityStorage) {
    return;
  }
  // create buttons
  cityStorage.forEach((item) => {
    const city = $(
      `<button class="city-history bg-green-500 hover:bg-blue-700 text-white font-bold py-1 my-1 px-4 border border-blue-700 rounded-md">${item}</button>`
    );
    historyContainer.append(city);
  });
}

// API call to find coordinates from city name
function getCoords(event, city) {
  event.preventDefault();
  const queryCity = city;
  // if user doesn't type anything

  if (queryCity === "") {
    alert("Choose a city!");
    return;
  }
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=${apiKey}&units=imperial`
  )
    .then((response) =>
      response.json().then((data) => {
        // use coordinates to get weather
        getWeather(data.coord.lat, data.coord.lon, data.name);
        //update local storage
        localStore(data.name);
      })
    )
    .catch((err) => {
      if (err) {
        $(".city").val("");
        alert(`That'\s not an acceptable city!`);
      }
    });
}

// API call for all weather data
function getWeather(lat, lon, name) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&appid=${apiKey}&units=imperial`
  )
    .then((res) =>
      res.json().then((data) => {
        // set weather for current conditions
        setTodayWeather(data, name);
        // set weather for the week
        setWeekWeather(data);
      })
    )
    .catch((err) => {
      if (err) {
        console.log(err);
        alert("Something went wrong, try again!");
      }
    });
}

// saving entries to local storage
function localStore(city) {
  const cityStorage = JSON.parse(localStorage.getItem("cities"));
  // create a storage array if it's empty
  if (!cityStorage) {
    const cityArr = [];
    cityArr.push(city);
    localStorage.setItem("cities", JSON.stringify(cityArr));
    // empty input

    $(".city").val("");

    // display history
    setHistory();
  } else {
    if (cityStorage.includes(city)) {
      // if the city is already in local storage, return
      $(".city").val("");
      return;
    } else {
      cityStorage.push(city);
      localStorage.setItem("cities", JSON.stringify(cityStorage));
      $(".city").val("");
      setHistory();
    }
  }
}
function setTodayWeather(data, name) {
  // data for today
  const today = data.current;

  //get timestamp from data and convert to a readable locale string
  let timeStamp = today.dt;
  let myDateTime = luxon.DateTime.fromSeconds(timeStamp);
  myDateTime = myDateTime.toLocaleString();

  // variables for HTML elements
  const cityDate = $(".city-date");
  const weatherIcon = $(".icon");
  const todayTemp = $(".today-temp");
  const todayWind = $(".today-wind");
  const todayHumidity = $(".today-humidity");
  const todayUV = $(".today-uv");

  // variable for UV Index
  const uvIndexVar = today.uvi;

  //  putting elements into array for easy emptying
  const weatherArr = [cityDate, todayTemp, todayHumidity, todayWind, todayUV];

  weatherArr.forEach((item) => {
    item.text("");
  });

  // updating DOM elements with data
  cityDate.text(`${name}\u00A0\u00A0\u00A0\u00A0${myDateTime}`);

  // icon
  weatherIcon.attr(
    "src",
    `http://openweathermap.org/img/w/${today.weather[0].icon}.png`
  );
  todayTemp.text(`Temp: ${today.temp}`);
  todayWind.text(`Wind: ${today.wind_speed} MPH`);
  todayHumidity.text(`Humidity: ${today.humidity}%`);
  todayUV.text(`UV Index: ${today.uvi}`);

  // Setting color of UV Index based on its value
  if (uvIndexVar <= 2) {
    todayUV.css("background-color", "green");
    todayUV.css("color", "white");
  } else if (uvIndexVar > 2 && uvIndexVar <= 5) {
    todayUV.css("background-color", "yellow");
    todayUV.css("color", "black");
  } else if (uvIndexVar > 5 && uvIndexVar <= 7) {
    todayUV.css("background-color", "orange");
    todayUV.css("color", "white");
  } else if (uvIndexVar > 7 && uvIndexVar <= 10) {
    todayUV.css("background-color", "red");
    todayUV.css("color", "white");
  } else {
    todayUV.css("background-color", "purple");
    todayUV.css("color", "");
  }
}

// Set the weather for the next five days
function setWeekWeather(data) {
  const weekContainer = $(".week-container");
  //empty container of previous values
  weekContainer.empty();
  const weekWeather = data.daily;

  //removing extra days from week array
  weekWeather.shift();
  weekWeather.splice(5, 2);

  for (day of weekWeather) {
    // get timestamp from data and convert to locale string
    let timeStamp = day.dt;
    let myDateTime = luxon.DateTime.fromSeconds(timeStamp);
    myDateTime = myDateTime.toLocaleString();

    // building card for each day and adding values from data
    const card = `<div class="flex flex-col rounded bg-slate-700 text-white shadow-md w-100 md:min-w-[9rem] p-4 m-1">
                      <h3>${myDateTime}</h3>
                      <img class="w-[4rem]" src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                      <p class="my-1">Temp: ${day.temp.day}</p>
                      <p class="my-1">Wind: ${day.wind_speed} MPH</p>
                      <p class="">Humidity: ${day.humidity}%</p>
                  </div>`;
    weekContainer.append(card);
  }
}

// Initial call to set history if app has been previously used
setHistory();

// Set initial page load to Philadelphia to avoid blank today container
window.onload = (event) => {
  getCoords(event, "Philadelphia");
};

// Event listener for search button
$(".search").on("click", function (event) {
  // get value from input
  const newCity = $(".city").val();
  // get coordinates from that city name
  getCoords(event, newCity);
});

// Get weather by clicking on any of the buttons in history
historyContainer.on("click", (event) =>
  getCoords(event, event.target.textContent)
);
