import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button 
            className="square"
            onClick={props.onClick}
            id={props.id}
        >
            {props.value}
        </button>
        );
}
  
  class Board extends React.Component {

    renderSquare(i) {
      return <Square 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        id={this.props.highlight.includes(i) ? "highlightedSquare" : "notHighlightedSquare"}/>;
    }
  
    render() {
      const rows = [];
      for (let i=0; i<3; i++) {
        let squares = []
        for (let j=0; j<3; j++) {
          const x = i * 3 + j;
          squares.push(this.renderSquare(x))
        }
        rows.push(
          <div className="board-row">
            {squares}
          </div>)
      }
      return (
        <div>
          {rows}
        </div>
      );
    }
  }
  
  class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            ascending: true,
            stepNumber: 0,
            xTurn: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1)
        const current_squares = history[history.length - 1].squares.slice()
        if (calculateWinner(current_squares) || current_squares[i]) {
            return;
        }
        current_squares[i] = this.state.xTurn ? 'X' : 'O';
        this.setState({
            history: history.concat([
                {
                  squares: current_squares
                }
              ]),
            stepNumber: history.length,
            xTurn: !this.state.xTurn,
        })
    }

    render() {
        const history = this.state.history;
        const current_squares = history[this.state.stepNumber].squares;
        const winner_squares = calculateWinner(current_squares);

        const moves = history.map((step, move) => {
            let last_move = "";
            if (move) {
              let i = 0;
              while (i < 9 && step.squares[i] === history[move-1].squares[i])
                i++;
              last_move = iToCoords(i);
            }
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} className={this.isSelected(move)}>
                        {move ? 
                            'Go to move #' + move + ": " + last_move : 
                            'Go to game start'}
                    </button>
                </li>
            );
        })

        let status;
        if (winner_squares) {
          status = current_squares[winner_squares[0]] + ' has won!';
        } else if (this.state.stepNumber === 9) {
          status = 'The game ended in a draw';
        } else {
          status = 'Next player: ' + (this.state.xTurn ? 'X' : 'O');
        }
        return (
            <div className="game">
            <div className="game-board">
                <Board 
                    squares={current_squares}
                    onClick={i => this.handleClick(i)}
                    highlight={winner_squares ? winner_squares : []}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{this.state.ascending ? moves : moves.reverse()}</ol>
                <div>
                  <button onClick={() => this.invertOrder()}>
                    Invert the order of the move list
                  </button>
                </div>
            </div>
            </div>
        );
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xTurn: (step % 2) === 0,
        })
    }

    isSelected(step) {
      if (step === this.state.stepNumber)
        return "selectedButton";
      return "notSelectedButton";
    }

    invertOrder() {
      this.setState({
        ascending: !this.state.ascending,
      });
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [a, b, c];
      }
    }
    return null;
  }

  function iToCoords(i) {
    const col = (i % 3) + 1;
    const row = (Math.floor(i / 3)) + 1;
    return "(col:" + col + ", row:" + row + ")";
  }