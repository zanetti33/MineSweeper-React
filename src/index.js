import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { useEffect } from 'react';

function Square(props) {
    return (
        <button 
            className="square"
            onClick={props.onClick}
        >
            {props.value}
        </button>
        );
}

function Board(props) {

  const renderSquare = (i) => {
    return <Square 
      value={props.displayed[i] ? props.cells[i].number : ""}
      onClick={() => props.onClick(i)}
      key={i}
      />;
  }

  const rows = [];
  for (let i=0; i<props.cells.length/props.width; i++) {
    let squares = [];
    for (let j=0; j<props.width; j++) {
      squares.push(renderSquare(i * props.width + j))
    }
    rows.push(
      <div className="board-row" key={i}>
        {squares}
      </div>)
  }
  return (
    <div>
      {rows}
    </div>
  );
}

function Game(props) {
  const length = props.boardHeight * props.boardWidth;
  const [displayed, setDisplayed] = useState(new Array(length).fill(false));
  const [status, setStatus] = useState("");

  useEffect(() => {
    // check if game is won
    console.log("checked!");
    if (isGameWon(displayed, props.boardHeight * props.boardWidth, props.bombs)) {
      setStatus("You won!");
    }
  }, [displayed]);//, props.boardHeight, props.boardWidth, props.bomb]);

  const handleClick = (i) => {
    let newArray = [...displayed];
    if (isGameWon(newArray, props.boardHeight * props.boardWidth, props.bombs) 
      || displayed[i]) {
      return;
    } else if (props.cells[i].bomb) {
      // game lost
      setStatus("You lost!");
    } else {
      // display that cell
      newArray[i] = true;
      setDisplayed(newArray);
    }
  }

  return (
    <div className="game-board">
      {status && <h1>{status}</h1>}
        <Board 
            cells={props.cells}
            onClick={i => handleClick(i)}
            displayed={displayed}
            width={props.boardWidth}
        />
    </div>
  );
}

function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [cells, setCells] = useState([]);
  const [gameOptions, setGameOptions] = useState({
    boardHeight: 0,
    boardWidth: 0,
    bombs: 0,
  });

  const handleChange = (event) => {
    setGameOptions({ ...gameOptions, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(gameOptions);
    if (gameOptions.boardHeight < 1 || gameOptions.boardWidth < 1) {
      setError("The board height and width must be at least 1 each!");
    } else if (gameOptions.boardHeight * gameOptions.boardWidth < gameOptions.bombs) {
      setError("Too many bombs for this board!");
    } else {
      setGameStarted(true);
      setCells(generateCells(gameOptions.bombs, gameOptions.boardHeight, gameOptions.boardWidth))
    }
  };

  if (gameStarted) {
    return <Game 
      boardHeight={gameOptions.boardHeight}
      boardWidth={gameOptions.boardWidth}
      bombs={gameOptions.bombs}
      cells={cells}
    />;
  } else {
    return (
      <div className="menu">
        {error && 
          <div className="menu-error">
            {error}
          </div>
        }
        <form onSubmit={handleSubmit}>
          <label>
            Altezza:
            <input type="number" name="boardHeight" value={gameOptions.boardHeight} onChange={handleChange}/>
          </label>
          <label>
            Larghezza:
            <input type="number" name="boardWidth" value={gameOptions.boardWidth} onChange={handleChange}/>
          </label>
          <label>
            Bombe:
            <input type="number" name="bombs" value={gameOptions.bombs} onChange={handleChange}/>
          </label>
          <input type="submit" value="start"/>
        </form>
      </div>
    );
  }
}



  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Home />);
  
  function isGameWon(displayedCells, n, bombs) {
    let cellOpened = 0;
    for (let i=0; i<n; i++) {
      if (displayedCells[i]) {
        cellOpened++;
      }
    }
    console.log(cellOpened, n, bombs, cellOpened >= (n - bombs));
    return cellOpened >= n - bombs;
  }

  function generateCells(k, h, w) {
    // generate all indexes from 0 to n-1
    const indexes = [];
    let i, tmp, j, x, n=h*w;
    for (i=0; i<n; i++) {
      indexes.push(i);
    }
    i = n;
    j = k;
    // shift k random indexes to the end of the array
    while (j > 0) {
      x = Math.floor(Math.random() * i);
      tmp = indexes[i-1];
      indexes[i-1] = indexes[x];
      indexes[x] = tmp;
      i--;
      j--;
    }
    // create n cells
    const cells = new Array(n).fill().map(u => ({
      bomb: false,
      number: 0
    }));
    // mark the selected indexes as bombs
    while (k > 0) {
      x = indexes.pop();
      cells[x].bomb = true;
      k--;
    }
    console.log(cells);
    // write the number in the cells
    for (i=0; i<n; i++) {
      // write the number only if it isn't a bomb
      if (!cells[i].bomb) {
        let adj_indexes = [];
        let r_i = Math.floor(i / w), c_i = i % w;
        for (let r = r_i - 1; r <= r_i + 1; r++) {
          for (let c = c_i - 1; c <= c_i + 1; c++) {
            if (r >= 0 && r < h &&
              c >= 0 && c < w) {
                adj_indexes.push(r * w + c);
              }
          }
        }
        // count the bombs
        x = 0;
        console.log(adj_indexes);
        adj_indexes.forEach(element => {
          if (cells[element].bomb)
            x++;
        });
        cells[i].number = x;
      }
    }
    return cells;
  }