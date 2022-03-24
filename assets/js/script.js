const apiKey = key;
const historyContainer = $(".history-container");

function setHistory() {
  historyContainer.empty();
  const cityStorage = JSON.parse(localStorage.getItem("cities"));
  if (!cityStorage) {
    return;
  }
  cityStorage.forEach((item) => {
    const city = $(
      `<button class="city-history bg-green-500 hover:bg-blue-700 text-white font-bold py-1 my-1 px-4 border border-blue-700 rounded-md">${item}</button>`
    );
    historyContainer.append(city);
  });
}
function latLon(event, city) {
  event.preventDefault();
  const queryCity = city;
  if (queryCity === "") {
    alert("Choose a city!");
    return;
  }
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=${apiKey}&units=imperial`
  )
    .then((response) =>
      response.json().then((data) => {
        getWeather(data.coord.lat, data.coord.lon, data.name);
        localStore(data.name);
      })
    )
    .catch((err) => {
      if (err) {
        console.log(err);
        $(".city").val("");
        alert(`That'\s not an acceptable city!`);
      }
    });
}
function getWeather(lat, lon, name) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&appid=${apiKey}&units=imperial`
  )
    .then((res) =>
      res.json().then((data) => {
        setTodayWeather(data, name);
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
function localStore(city) {
  const cityStorage = JSON.parse(localStorage.getItem("cities"));

  if (!cityStorage) {
    const cityArr = [];
    cityArr.push(city);
    localStorage.setItem("cities", JSON.stringify(cityArr));
    $(".city").val("");
    setHistory();
  }
  if (cityStorage.includes(city)) {
    $(".city").val("");
    return;
  } else {
    cityStorage.push(city);
    localStorage.setItem("cities", JSON.stringify(cityStorage));
    $(".city").val("");
    setHistory();
  }
}
function setTodayWeather(data, name) {
  const today = data.current;
  let timeStamp = today.dt;
  let myDateTime = luxon.DateTime.fromSeconds(timeStamp);
  myDateTime = myDateTime.toLocaleString();

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
  cityDate.text(`${name}\u00A0\u00A0\u00A0\u00A0${myDateTime}`);
  weatherIcon.attr(
    "src",
    `http://openweathermap.org/img/w/${today.weather[0].icon}.png`
  );
  todayTemp.text(`Temp: ${today.temp}`);
  todayWind.text(`Wind: ${today.wind_speed} MPH`);
  todayHumidity.text(`Humidity: ${today.humidity}%`);
  todayUV.text(`UV Index: ${today.uvi}`);
}
function setWeekWeather(data) {
  const weekContainer = $(".week-container");
  weekContainer.empty();
  const weekWeather = data.daily;
  weekWeather.shift();
  weekWeather.splice(5, 2);

  for (day of weekWeather) {
    let timeStamp = day.dt;
    let myDateTime = luxon.DateTime.fromSeconds(timeStamp);
    myDateTime = myDateTime.toLocaleString();
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
setHistory();

$(".search").on("click", function (event) {
  const newCity = $(".city").val();
  latLon(event, newCity);
});
historyContainer.on("click", (event) =>
  latLon(event, event.target.textContent)
);
