const apiKey = key;
const historyContainer = $(".history-container");
function localStore(event) {
  event.preventDefault();
  const newCity = $(".city").val();
  latLon(newCity);
  if (newCity === "") {
    alert("Choose a city!");
    return;
  }
  const cityStorage = JSON.parse(localStorage.getItem("cities"));

  if (!cityStorage) {
    const cityArr = [];
    cityArr.push(newCity);
    localStorage.setItem("cities", JSON.stringify(cityArr));
    $(".city").val();
    setHistory();
  }
  if (cityStorage.includes(newCity)) {
    $(".city").val("");
    return;
  } else {
    cityStorage.push(newCity);
    localStorage.setItem("cities", JSON.stringify(cityStorage));
    $(".city").val("");
    setHistory();
  }
}
function setHistory() {
  historyContainer.empty();
  const cityStorage = JSON.parse(localStorage.getItem("cities"));
  if (!cityStorage) {
    return;
  }
  cityStorage.forEach((item) => {
    const city = $(
      `<button class="city bg-green-500 hover:bg-blue-700 text-white font-bold py-1 my-1 px-4 border border-blue-700 rounded-md">${item}</button>`
    );
    historyContainer.append(city);
  });
}

function getWeather(lat, lon, name) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&appid=${apiKey}&units=imperial`
  ).then((res) =>
    res.json().then((data) => {
      setTodayWeather(data, name);
    })
  );
}
function setTodayWeather(data, name) {
  const today = data.current;
  const cityDate = $(".city-date");
  const weatherIcon = $(".icon");
  const todayTemp = $(".today-temp");
  const todayWind = $(".today-wind");
  const todayHumidity = $(".today-humidity");
  const todayUV = $(".today-uv");

  const weatherArr = [cityDate, todayTemp, todayHumidity, todayWind, todayUV];
  weatherArr.forEach((item) => {
    item.text("");
  });
  cityDate.text(`${name}`);
  weatherIcon.attr(
    "src",
    `http://openweathermap.org/img/w/${today.weather[0].icon}.png`
  );
  todayTemp.text(`Temp: ${today.temp}`);
  todayWind.text(`Wind: ${today.wind_speed} MPH`);
  todayHumidity.text(`Humidity: ${today.humidity}%`);
  todayUV.text(`UV Index: ${today.uvi}`);
}

function latLon(city) {
  const queryCity = city;
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=${apiKey}&units=imperial`
  ).then((response) =>
    response.json().then((data) => {
      getWeather(data.coord.lat, data.coord.lon, data.name);
    })
  );
}

$(".search").on("click", localStore);
setHistory();
