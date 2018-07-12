# Baccarat ScoreBoard Calculator
Currently this only works with CommonJS;


### Usage
```
const input: ReadonlyArray<string> = [] // Data input;
const board = ScoreBoard.fromRawData(input);
const bigRoad = board.getBigRoad(6, 42);

for (let row = 0; row < bigRoad.rowCount; row++) {
  for (let column = 0; column < bigRoad.columnCount; column++) {
    const item: RoundResult | undefined = bigRoad.getItem(row, column);
    // Do whatever you want with item data;
  }
}

// Or you can use with an iteration handler
bigRoad.forEach((item, rowIndex, columnIndex) =>
  // Do whatever you want with item data;
  global.console.log(`[${rowIndex}, ${columnIndex}]:`, item),
);
```
