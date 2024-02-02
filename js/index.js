const container = document.querySelector(".container");
let gameStatus = "";
const result = document.querySelector(".result");
//size selection
const size = document.getElementById("size");
//default size
let row = 9;
let col = 9;
size.addEventListener("change", (e) => {
	let value = e.target.value.split("x"); // width x height
	col = parseInt(value[0]);
	row = parseInt(value[1]);
	restart();
});

function run() {
	// init the view of the game
	let main = document.createElement("div");
	main.classList.add("main");

	main.style.width = `${col * 40}px`;
	container.appendChild(main);

	const blockArray = []; // store each row blocks
	let tempArray = []; // temp store each col blocks in a row
	const numOfBlock = row * col;
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
	const itemsArray = new Array(row).fill().map(() => new Array(col).fill(0));

	// 10 indicate is opened
	const ItemEnum = {
		EMPTY: 0,
		ONE: 1,
		TWO: 2,
		THREE: 3,
		FOUR: 4,
		FIVE: 5,
		SIX: 6,
		SEVEN: 7,
		EIGHT: 8,
		MINE: 9,
		CLEARED: 10,
	};

	const itemsMapToClass = {
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
	const mines = [];
	const numberOfMines = Math.floor(numOfBlock * 0.2);

	// start init all data item after first click
	main.addEventListener("click", handleFirstClick);
	function handleFirstClick(e) {
		const event = e || window.event;
		const target = event.target || event.srcElement;
		const targetIndex = getTargetIndex(target);

		initItems(targetIndex);

		//uncover the clicked block
		if (itemsArray[targetIndex.row][targetIndex.col] === ItemEnum.EMPTY) {
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
				return targetIndex;
			}
		}
		return -1;
	}

	// initialize the data items
	function initItems(firstClickBlock) {
		// place mine randomly
		let numOfMine = numberOfMines;
		while (numOfMine) {
			let randomRow = Math.floor(Math.random() * row);
			let randomCol = Math.floor(Math.random() * col);

			// not placing mine on the first clicked block
			if (
				(firstClickBlock.row === randomRow && firstClickBlock.col === randomCol) ||
				itemsArray[randomRow][randomCol] === ItemEnum.MINE
			) {
				continue;
			}

			mines.push({ row: randomRow, col: randomCol });
			itemsArray[randomRow][randomCol] = ItemEnum.MINE;
			numOfMine--;
		}

		//calcualte nearby mine
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (itemsArray[i][j] === ItemEnum.EMPTY) {
					itemsArray[i][j] = getNoOfNearbyMine(i, j);
				}
			}
		}

		// console.log(itemsArray);
	}

	//calculate near by mine
	function getNoOfNearbyMine(rowIndex, colIndex) {
		let count = 0;
		const startCountRow = rowIndex === 0 ? 0 : rowIndex - 1,
			endCountRow = rowIndex === row - 1 ? rowIndex : rowIndex + 1,
			startCountCol = colIndex === 0 ? 0 : colIndex - 1,
			endCountCol = colIndex === col - 1 ? colIndex : colIndex + 1;

		for (let i = startCountRow; i <= endCountRow; i++) {
			for (let j = startCountCol; j <= endCountCol; j++) {
				if (i === rowIndex && j === colIndex) continue;
				if (itemsArray[i][j] === ItemEnum.MINE) {
					count++;
				}
			}
		}

		return count;
	}

	// games started
	function handleGameClicks(e) {
		const event = e || window.event;
		const target = event.target || event.srcElement;

		const targetIndex = getTargetIndex(target);
		if (targetIndex === -1) return;

		const item = itemsArray[targetIndex.row][targetIndex.col];

		switch (item) {
			case ItemEnum.CLEARED:
				return;
			case 9:
				removeAllHandler();
				gameStatus = "lose";
				uncoverAllMines();
				result.children[1].style.display = "block";
				return;
			case 0:
				uncoverAllEmptyBlockOf(targetIndex.row, targetIndex.col);
				break;
			default:
				uncoverBlockOf(targetIndex.row, targetIndex.col);
				break;
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
	function uncoverAllEmptyBlockOf(rowIndex, colIndex) {
		//out of boundary
		if (rowIndex < 0 || rowIndex >= row || colIndex < 0 || colIndex >= col) return;

		//visited/uncovered
		if (itemsArray[rowIndex][colIndex] === ItemEnum.CLEARED) return;

		const item = itemsArray[rowIndex][colIndex];
		if (item !== ItemEnum.EMPTY) {
			uncoverBlockOf(rowIndex, colIndex); // uncover the last block (to show the num)
			return;
		}
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
		if (itemsArray[rowIndex][colIndex] === ItemEnum.CLEARED) return;

		const block = blockArray[rowIndex][colIndex];
		const item = itemsArray[rowIndex][colIndex];
		let span = document.createElement("span");
		if (item !== ItemEnum.EMPTY) {
			span.className = itemsMapToClass[item];
		}
		// remove flag icon
		block.classList.remove("iconfont");
		block.classList.remove("icon-flag");

		block.classList.add("cleared");
		block.appendChild(span);
		itemsArray[rowIndex][colIndex] = ItemEnum.CLEARED;
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
				if (itemsArray[i][j] !== ItemEnum.CLEARED && itemsArray[i][j] !== ItemEnum.MINE) {
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
		const event = e || window.event;
		if (event.button === 2) {
			const target = event.target || event.srcElement;
			if (!target.classList.contains("block")) return;
			const targetIndex = getTargetIndex(target);
			const block = blockArray[targetIndex.row][targetIndex.col];
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

// restart button
document.querySelector(".restart").addEventListener("click", restart);
function restart() {
	container.innerHTML = "";
	result.children[0].style.display = "none";
	result.children[1].style.display = "none";

	run();
}

run();
