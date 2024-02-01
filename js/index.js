let container = document.querySelector(".container");
let gameStatus = "";
let result = document.querySelector(".result");

function run() {
	// init the view of the game
	let main = document.createElement("div");
	main.classList.add("main");
	let row = 9;
	let col = 9;
	main.style.width = `${col * 50}px`;
	container.appendChild(main);

	let blockArray = []; // store each row blocks
	let tempArray = []; // temp store each col blocks in a row
	let numOfBlock = row * col;
	for (let i = 0; i < numOfBlock; i++) {
		let block = document.createElement("div");
		block.classList.add("block");
		main.appendChild(block);

		tempArray.push(block);
		if ((i + 1) % col === 0) {
			blockArray.push(tempArray);
			tempArray = [];
		}
	}
	// END Of INIT VIEW

	// init the items after first clicks
	let itemsArray = new Array(row).fill().map(() => new Array(col).fill(0));
	// 10 indicate is opened
	let itemsMapToClass = {
		0: "",
		1: "one",
		2: "two",
		3: "three",
		4: "four",
		5: "five",
		6: "six",
		7: "seven",
		8: "eight",
		9: "icon-saoleix iconfont", //mine
	};

	// store all indexs of mines to uncover when game over
	let mines = [];

	// start init all data item after first click
	main.addEventListener("click", handleFirstClick);
	function handleFirstClick(e) {
		let event = e || window.event;
		let target = event.target || event.srcElement;
		let targetIndex = getTargetIndex(target);

		initItems(targetIndex);

		//uncover the clicked block
		if (itemsArray[targetIndex.row][targetIndex.col] === 0) {
			uncoverAllEmptyBlockOf(targetIndex.row, targetIndex.col);
		} else {
			uncoverBlockOf(targetIndex.row, targetIndex.col);
		}

		main.removeEventListener("click", handleFirstClick);
		main.addEventListener("click", handleGameClicks);
	}

	function getTargetIndex(target) {
		let targetIndex = {};
		for (let i = 0; i < row; i++) {
			let temp = blockArray[i].indexOf(target);
			if (temp !== -1) {
				targetIndex.row = i;
				targetIndex.col = temp;
				break;
			}
		}
		return targetIndex;
	}

	// initialize the data items
	function initItems(firstClickBlock) {
		// place mine randomly
		let numOfMine = getNoOfmine(col);
		while (numOfMine) {
			let randomRow = Math.floor(Math.random() * row);
			let randomCol = Math.floor(Math.random() * col);

			// not placing mine on the first clicked block
			if ((firstClickBlock.row === randomRow && firstClickBlock.col === randomCol) || itemsArray[randomRow][randomCol] === 9) {
				continue;
			}

			mines.push({ row: randomRow, col: randomCol });
			itemsArray[randomRow][randomCol] = 9;
			numOfMine--;
		}

		//calcualte nearby mine
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (itemsArray[i][j] === 0) {
					itemsArray[i][j] = getNoOfNearbyMine(i, j);
				}
			}
		}

		console.log(itemsArray);
	}

	//calculate near by mine
	function getNoOfNearbyMine(rowIndex, colIndex) {
		let count = 0;
		let startCountRow = rowIndex === 0 ? 0 : rowIndex - 1,
			endCountRow = rowIndex === row - 1 ? rowIndex : rowIndex + 1,
			startCountCol = colIndex === 0 ? 0 : colIndex - 1,
			endCountCol = colIndex === col - 1 ? colIndex : colIndex + 1;

		for (let i = startCountRow; i <= endCountRow; i++) {
			for (let j = startCountCol; j <= endCountCol; j++) {
				if (itemsArray[i][j] === 9) {
					count++;
				}
			}
		}

		return count;
	}

	// get the number of mine depends on the number of column
	function getNoOfmine(column) {
		switch (column) {
			case 9:
				return 10;
			case 16:
				return 40;
			case 30:
				return 99;
			default:
				return 2;
		}
	}

	// games started
	function handleGameClicks(e) {
		let event = e;
		let target = event.target;
		if (target.children.length > 0) return;

		let targetIndex = getTargetIndex(target);
		if (!target.classList.contains("block")) return;

		let item = itemsArray[targetIndex.row][targetIndex.col];

		if (item === 9) {
			removeAllHandler();
			gameStatus = "lose";
			uncoverAllMines();
			result.children[1].style.display = "block";
			return;
		} else if (item === 0) {
			uncoverAllEmptyBlockOf(targetIndex.row, targetIndex.col);
		} else {
			uncoverBlockOf(targetIndex.row, targetIndex.col);
		}

		// check if the game is over
		gameStatus = checkGameStatus();
		if (gameStatus === "win") {
			removeAllHandler();
			uncoverAllMines();
			result.children[0].style.display = "block";
		}
	}

	// using flood fill method
	let tempVisited = new Array(row).fill().map(() => new Array(col).fill(false));
	function uncoverAllEmptyBlockOf(rowIndex, colIndex) {
		//out of boundary
		if (rowIndex < 0 || rowIndex >= row || colIndex < 0 || colIndex >= col) return;

		//visited
		if (tempVisited[rowIndex][colIndex]) return;

		let item = itemsArray[rowIndex][colIndex];
		if (item !== 0) {
			uncoverBlockOf(rowIndex, colIndex); // uncover the last block (to show the num)
			return;
		}

		tempVisited[rowIndex][colIndex] = true; //set visited
		uncoverBlockOf(rowIndex, colIndex);

		uncoverAllEmptyBlockOf(rowIndex - 1, colIndex); // up
		uncoverAllEmptyBlockOf(rowIndex + 1, colIndex); // down
		uncoverAllEmptyBlockOf(rowIndex, colIndex + 1); // right
		uncoverAllEmptyBlockOf(rowIndex, colIndex - 1); // left
		// uncoverAllEmptyBlockOf(rowIndex - 1, colIndex - 1); // up left
		// uncoverAllEmptyBlockOf(rowIndex - 1, colIndex + 1); // up right
		// uncoverAllEmptyBlockOf(rowIndex + 1, colIndex - 1); // down left
		// uncoverAllEmptyBlockOf(rowIndex + 1, colIndex + 1); //down right
	}

	function uncoverBlockOf(rowIndex, colIndex) {
		if (rowIndex < 0 || rowIndex >= row || colIndex < 0 || colIndex >= col) return;
		if (itemsArray[rowIndex][colIndex] === 10) return;

		let block = blockArray[rowIndex][colIndex];
		let item = itemsArray[rowIndex][colIndex];
		let span = document.createElement("span");
		if (item !== 0) {
			span.className = itemsMapToClass[item];
		}
		// remove flag icon
		block.classList.remove("iconfont");
		block.classList.remove("icon-flag");

		block.classList.add("cleared");
		block.appendChild(span);
		itemsArray[rowIndex][colIndex] = 10;
	}

	function uncoverAllMines() {
		for (let mine of mines) {
			uncoverBlockOf(mine.row, mine.col);
		}
	}

	function checkGameStatus() {
		let flag = "win";
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (itemsArray[i][j] !== 10 && itemsArray[i][j] !== 9) {
					flag = "";
					break;
				}
			}
			if (flag === "") break;
		}
		return flag;
	}

	//set right click event, set flags
	main.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	});

	main.addEventListener("mousedown", handleRightClick);
	function handleRightClick(e) {
		let event = e || window.event;
		if (e.button === 2) {
			let target = event.target || event.srcElement;
			if (!target.classList.contains("block")) return;
			let targetIndex = getTargetIndex(target);
			let block = blockArray[targetIndex.row][targetIndex.col];
			if (!block.classList.contains("cleared")) {
				block.classList.toggle("iconfont");
				block.classList.toggle("icon-flag");
			}
		}
	}

	function removeAllHandler() {
		main.removeEventListener("click", handleGameClicks);
		main.removeEventListener("mousedown", handleRightClick);
	}
}

document.querySelector(".restart").addEventListener("click", restart);
function restart() {
	container.innerHTML = "";
	result.children[0].style.display = "none";
	result.children[1].style.display = "none";

	run();
}

run();
