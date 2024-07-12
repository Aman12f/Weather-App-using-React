import React, { useEffect, useState } from "react";
import "./weather.css";
import cityTimezones from 'city-timezones';

const Whether = () => {
  // State to hold weather data
  const [weatherData, setWeatherData] = useState(null);
  
  // State to hold city input
  const [city, setCity] = useState({ search: "London" });
  
  // State to hold the selected city for search
  const [selectedCity, setSelectedCity] = useState("");
  
  // State to hold error messages
  const [errorMessage, setErrorMessage] = useState("");
  
  // URL for weather icon, updated later based on weather data
  let iconUrl;

  // Function to fetch weather data based on city name
  const search = async (city) => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY; // Your API key from environment variables
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      // If the response is successful, update the weather data state
      if (response.ok) {
        setWeatherData({
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          temperature: Math.floor(data.main.temp),
          location: data.name,
          icon: data.weather[0].icon,
          main: data.weather[0].main,
          country: data.sys.country,
          visibility: ((data.visibility) / 1609.34).toFixed(2), // Convert visibility to miles
        });
        setErrorMessage(""); // Clear any previous error messages
      } else {
        setWeatherData(null); // Reset weather data if the response is not successful
        setErrorMessage(weatherData); // Set the error message
        console.log(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setErrorMessage("An error occurred while fetching weather data");
    }
  };

  // Update icon URL based on weather data
  iconUrl = weatherData ? `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` : "";

  // Fetch weather data whenever the selected city changes
  useEffect(() => {
    search(city.search);
  }, [selectedCity]);

  // Fetch initial date and time for a default time zone
  useEffect(() => {
    const dateTime = getCityDateTime("America/Toronto");
    setCurrentDateTime(dateTime);
  }, []);

  // Handle changes in the city input field
  const handleOnChange = (e) => {
    setCity({ ...city, [e.target.name]: e.target.value });
  };
  
  // Function to get current date and time for a given time zone
  function getCityDateTime(cityTimeZone) {
    const dateOptions = {
      timeZone: cityTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long', // Include the day of the week
    };

    const timeOptions = {
      timeZone: cityTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const dateFormatter = new Intl.DateTimeFormat([], dateOptions);
    const timeFormatter = new Intl.DateTimeFormat([], timeOptions);

    const now = new Date();

    const date = dateFormatter.format(now);
    const time = timeFormatter.format(now);

    return { date, time };
  }

  // State to hold current date and time
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Handle the search button click
  const handleOnClick = (e) => {
    e.preventDefault();
    
    if (city.search.trim() === "") {
      alert("City must not be blank");
      return;
    }

    // Look up city time zone and get date and time for that time zone
    const cityLookup = cityTimezones.lookupViaCity(city.search.trim());
    if (cityLookup.length > 0) {
      console.log(cityLookup);
      console.log(`Time zone of ${cityLookup[0].city} is ${cityLookup[0].timezone}`);
      
      const cityTimeZone = cityLookup[0].timezone;
      const dateTime = getCityDateTime(cityTimeZone);
      setCurrentDateTime(dateTime);
      setSelectedCity(city.search.trim());
    } else {
      console.error("City not found in time zones database");
      alert("Please enter valid city Name");
    }
  };

  return (
    <>
      {errorMessage && <p className="text-white">{errorMessage}</p>}
      {weatherData && (
        <>
          <div className="full-screen-container"> 
            <div className="container parent d-flex flex-row justify-content-start">
              <div className="ch1 d-flex flex-column justify-content-between align-items-center" id="cid1">
                <div className="c3 d-flex flex-column align-self-end">
                  <div className="" style={{fontSize:"28px"}}>{weatherData.location}</div>
                  <div className="align-self-end" style={{fontSize:"28px"}}>{weatherData.country}</div>
                </div>
                <div className="c4 d-flex justify-content-around">
                  <div className="c6">
                    <div style={{fontSize:"28px"}}>{currentDateTime.time}</div>
                    <div>{currentDateTime.date}</div>
                  </div>
                  <div className="c7" style={{fontSize:"47px"}}>
                    {weatherData.temperature}°c
                  </div>
                </div>
              </div>
              <div className="ch2 d-flex flex-column align-items-center" id="cid2">
                <div className="ch21 d-flex flex-column ">
                  <div className="image">
                    <img src={iconUrl} alt="Weather icon"/>
                  </div>
                  <div className="d-flex flex-column align-items-center">
                    <p>{weatherData.main}</p>
                  </div>
                </div>
                <div className="ch22">
                  <div className="w-100 mt-1">
                    <div className="input-group input">
                      <input
                        type="text"
                        className="form-control searchBar"
                        placeholder="Search"
                        aria-label="Recipient's username"
                        aria-describedby="basic-addon2"
                        onChange={handleOnChange}
                        name="search"
                        value={city.search}
                      />
                      <div className="input-group-append">
                        <button
                          className="btn search-button"
                          type="button"
                          onClick={handleOnClick}
                        >
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ch23 mt-3" style={{ fontSize: '22px' ,fontWeight: 'bold'}}>
                  <p>{weatherData.country ? weatherData.country : ""},{weatherData.location ? weatherData.location : ""}</p>
                </div>
                <div className="ch24">
                  <table>
                    <thead>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Temperature</td>
                        <td>{weatherData.temperature}°c({weatherData.description})</td>
                      </tr>
                      <tr>
                        <td>Humidity</td>
                        <td>{weatherData.humidity}%</td>
                      </tr>
                      <tr>
                        <td>Visibility</td>
                        <td>{weatherData.visibility} mi</td>
                      </tr>
                      <tr>
                        <td>Wind Speed</td>
                        <td>{weatherData.windSpeed} 3Km/h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Whether;
