"use client";
import { useEffect, useState } from "react";
import Heatmap from "@/components/heatmap";

export default function Home() {
  const [options, setOptions] = useState(["Loading..."]);
  const [selectedOption, setSelectedOption] = useState("Loading...");
  const [numCandlesticks, setNumCandlesticks] = useState(1000);
  const [timeframe, setTimeframe] = useState("H1");
  const [apires, setApires] = useState("Nothing fetched yet");
  const [finalMatrix, setFinalMatrix] = useState([[]]);
  const [countMatrix, setCountMatrix] = useState([[]]);
  const [threshold, setThreshold] = useState(50.0);
  const [volatility, setVolatility] = useState(0.0);

  const handleInputChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleNumCandlesticksChange = (event) => {
    setNumCandlesticks(event.target.value);
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };
  const matrixToObjectArr = (matrix) => {
    const objectsArr = matrix
      .map((row, y) =>
        row.map((value, x) => ({
          x: (x + 1).toString(),
          y: (y + 1).toString(),
          value,
        }))
      )
      .flat();
    return objectsArr;
  };

  const handleSubmit = () => {
    const payload = {
      symbol: selectedOption,
      timeframe: timeframe,
      start_pos: 0,
      count: parseInt(numCandlesticks),
      multiplier: parseInt(volatility),
      threshold: parseInt(threshold),
      closeOnly: 1,
    };
    setApires("Loading...");
    fetch("http://10.211.55.6:8000/copy_rates_from_pos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        // setApires(data.text.replace("\n", "<br/>"));
        setApires(data.text);
        const matrix = `{"x":${data.final},
                        "y":${data.countFinal}}`;
        setFinalMatrix(JSON.parse(matrix)["x"]);
        setCountMatrix(JSON.parse(matrix)["y"]);
      })
      .catch((error) => {
        console.error("ERROR! : ", error);
        setApires("FAILED! : " + error);
      });
  };

  useEffect(() => {
    let isSubbed = true;
    fetch("http://10.211.55.6:8000/symbols")
      .then((res) => res.json())
      .then((data) => {
        if (isSubbed) {
          console.log(data);
          setOptions(data);
          setSelectedOption(data[0]);
        }
      })
      .catch((e) => {
        setOptions(["Fetching Data Failed!"]);
        isSubbed = false;
      });
    return () => {
      isSubbed = false;
    };
  }, []);
  return (
    <div className="p-6">
      <h1>My Page</h1>
      <label>
        Symbol:
        <select
          className="text-black"
          value={selectedOption}
          onChange={handleInputChange}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Number of Candlesticks:
        <input
          className="text-black"
          type="number"
          value={numCandlesticks}
          onChange={handleNumCandlesticksChange}
        />
      </label>
      <label>
        Percentage Threshold:
        <input
          className="text-black"
          min={50}
          max={100}
          type="number"
          value={threshold}
          onChange={(e) =>
            e.target.value > 100
              ? setThreshold(100.0)
              : e.target.value < 50
              ? setThreshold(50)
              : setThreshold(e.target.value)
          }
        />
      </label>
      <label>
        Volatility Multiplier
        <input
          className="text-black"
          min={0.0}
          max={4.0}
          type="number"
          value={volatility}
          onChange={(e) =>
            e.target.value > 100
              ? setVolatility(4)
              : e.target.value < 0
              ? setVolatility(0)
              : setVolatility(e.target.value)
          }
        />
      </label>
      <br />
      <label>
        Timeframe:
        <select
          className="text-black"
          value={timeframe}
          onChange={handleTimeframeChange}
        >
          <option value="M5">M5</option>
          <option value="M15">M15</option>
          <option value="M20">M20</option>
          <option value="M30">M30</option>
          <option value="H1">H1</option>
          <option value="H2">H2</option>
          <option value="H4">H4</option>
        </select>
      </label>
      <br />
      <button onClick={handleSubmit}>Fetch Data</button>
      <br />
      <textarea
        readOnly
        className="border-2 border-gray-700 p-4 my-4 text-black w-10/12 h-80 cursor-default"
        value={apires}
      ></textarea>

      {finalMatrix[0] ? (
        <Heatmap
          width={700}
          height={700}
          data={matrixToObjectArr(finalMatrix)}
        ></Heatmap>
      ) : (
        <></>
      )}

      <textarea
        readOnly
        className="border-2 border-gray-700 p-4 my-4  text-black w-10/12 h-80 cursor-default"
        value={finalMatrix}
      ></textarea>
      <textarea
        readOnly
        className="border-2 border-gray-700 p-4 my-4  text-black w-10/12 h-80 cursor-default"
        value={countMatrix}
      ></textarea>
    </div>
  );
}
