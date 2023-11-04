const searchBtn = document.querySelector(".search-button");
const result = document.querySelector(".content");
let searchInputValue;

const watchlistContainer = document.querySelector("#watchlist-container");

const DAILY = "Time Series (Daily)";
const INTRADAY = "Time Series (5min)";
const MONTHLY = "Monthly Time Series";
const WEEKLY = "Weekly Time Series";

searchBtn.addEventListener("click", (event) => {
  searchInputValue = document.querySelector(".search-input").value;
  if(searchInputValue.trim()===""){
    alert("Please enter a stock symbol in the search bar.");
  }else{
  getDurationForStock("DAILY");
  }
});

async function getData(type, stockName) {
  //type='INTRADAY'
  //stockName='AMZN'

  const URL=`https://www.alphavantage.co/query?function=TIME_SERIES_${type}&symbol=${stockName}&interval=5min&apikey=WJD77VHJHFZEYA64`
  let response = await fetch(URL);
  let result = response.json();

  return await result;
}

function toggle(id) {
  const tableElement = document.getElementById(id);
  tableElement.classList.toggle("hidden");
}

function removeData(id) {
  const tableElement = document.getElementById(`deleteKey_${id}`);
  tableElement?.remove();
}

const stockTableData = {};
function getDurationForStock(timeSeriesType) {
  if (!searchInputValue) {
    return;
  }

  searchInputValue = document.querySelector(".search-input").value;
  //timeSeriesType='INTRADAY'
  getData(timeSeriesType, searchInputValue ? searchInputValue : "AMZN").then(
    (data) => {
      console.log("data :", data);

      if (!("Meta Data" in data)) {
        alert("invalid data");
        console.log("No Data");
        return;
      }

      let keyType;
      if (timeSeriesType === "DAILY") {
        keyType = DAILY;
      } else if (timeSeriesType === "INTRADAY") {
        keyType = INTRADAY;
      } else if (timeSeriesType === "MONTHLY") {
        keyType = MONTHLY;
      } else if (timeSeriesType === "WEEKLY") {
        keyType = WEEKLY;
      }

      const metaData = data["Meta Data"];
      const timeSeriesMetaData = data[keyType];
      const lastRefreshed = metaData["3. Last Refreshed"];

      const open = parseFloat(timeSeriesMetaData[lastRefreshed]["1. open"]);
      const close = parseFloat(timeSeriesMetaData[lastRefreshed]["4. close"]);

      let colorType;

      if (open > close) {
        colorType = "red";
      } else if (open > close) {
        colorType = "green";
      } else {
        colorType = "white";
      }

      const ID = Date.now();
      stockTableData[ID] = [];
      for (let key in timeSeriesMetaData) {
        const stockValues = timeSeriesMetaData[key];

        if (stockTableData[ID].length === 5) break;
        const ele = `<tr>
          <td>${key}</td>
            <td>${stockValues["1. open"]}</td>
            <td>${stockValues["2. high"]}</td>
            <td>${stockValues["3. low"]}</td>
            <td>${stockValues["4. close"]}</td>
            <td>${stockValues["5. volume"]}</td>
        </tr>`;
        stockTableData[ID].push(ele);
      }

      watchlistContainer.insertAdjacentHTML(
        "afterend",
        `
        <div id="deleteKey_${ID}">
          <div class="watchlist-item" onclick="toggle(${ID})">
            <div class="icon">${metaData["2. Symbol"]}</div>
            <span class="watchlist-text bg_${colorType}">123.45</span>
            <span class="watchlist-day">${timeSeriesType}</span>
            <button type="button" class="remove-button" onclick="removeData(${ID})">+</button>
          </div>
          <div id="${ID}" class="item-result mt-10 hidden">
                  <div class="table-container">
                  <table class="custom-table">
                      <thead>
                          <tr>
                              <th>${lastRefreshed}</th>
                              <th>Open</th>
                              <th>Close</th>
                              <th>High</th>
                              <th>Low</th>
                              <th>Volume</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${stockTableData[ID]}                     
                      </tbody>
                  </table>
                  </div>
              </div>
        </div>
      `
      );
    }
  );
} 
