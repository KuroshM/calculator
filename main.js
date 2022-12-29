const getPropValue = (elem, prop) => {
	return getComputedStyle(elem).getPropertyValue(prop);
};

const getPropValueInt = (elem, prop) => {
	return parseInt(getPropValue(elem, prop));
};

const getPropValueFloat = (elem, prop) => {
	return parseFloat(getPropValue(elem, prop));
};

const root = document.documentElement;
const body = document.getElementsByTagName("body")[0];
const main = document.getElementById("main");
const input = document.getElementById("input");
const output = document.getElementById("output");
const btnClickTime = getPropValueFloat(root, "--btn-click-time") * 1000;
const mainWidth = getPropValueInt(input, "width");
ß;

let cursorPos = 0;
let isFinalized = false;
let showError = false;

class Key {
	constructor(name, text, onClickEvent, color, keyboardKey) {
		this.name = name;
		this.text = text;
		this.onClickEvent = onClickEvent;
		this.color = color;
		this.keyboardKey = keyboardKey || [text];
	}

	click() {
		const btn = document.getElementById(this.name);
		btn.classList.add("clicked");
		eval(`${this.onClickEvent}`);
		setTimeout(() => {
			btn.classList.remove("clicked");
		}, btnClickTime);
	}
}

const initKeys = () => {
	const keys = [];
	for (let num = 0; num < 10; num++) {
		keys.push(new Key(`b_${num}`, `${num}`, `typeIt("${num}")`, "btn-color1"));
	}
	keys.push(new Key("point", ".", 'typeIt(".")', "btn-color1"));
	[
		{ text: "+", name: "plus" },
		{ text: "-", name: "minus" },
		{ text: "\xD7", name: "multiply", keyboardKey: ["*"] },
		{ text: "\xF7", name: "divide", keyboardKey: ["/"] },
	].forEach(({ name, text, keyboardKey }) => {
		keys.push(
			new Key(name, text, `typeIt(\"${text}\")`, "btn-color2", keyboardKey)
		);
	});
	[
		{ text: "(", name: "open" },
		{ text: ")", name: "close" },
	].forEach(({ name, text }) => {
		keys.push(new Key(name, text, `typeIt(\"${text}\")`, "btn-color2"));
	});
	keys.push(new Key("clear", "C", "clearAll()", "btn-color3", ["Escape"]));
	keys.push(new Key("back", "<", "clearBack()", "btn-color3", ["Backspace"]));
	keys.push(new Key("equal", "=", "finalize()", "btn-color2", ["Enter", "="]));
	return keys;
};

const keys = initKeys();

const isMobile = () => {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
};

const setHeight = () => {
	const vh = window.innerHeight;
	document.documentElement.style.setProperty("--viewport-height", `${vh}px`);
};

const windowResized = () => {
	setHeight();
	resizeInOutText();
};

const clickIt = (keyIndex) => {
	keys[keyIndex].click();
};

const init = () => {
	keys.forEach((key, index) => {
		const newButton = document.createElement("button");
		newButton.id = key.name;
		newButton.classList.add("button");
		newButton.classList.add(key.color);
		newButton.innerText = key.text;
		newButton.setAttribute("onclick", `clickIt(${index})`);
		newButton.style.gridArea = key.name;
		main.appendChild(newButton);
	});

	if (isMobile()) {
		input.setAttribute("readonly", "readonly");
	}

	setHeight();

	body.addEventListener("keydown", keyPressedEvent);
	input.addEventListener("click", inputClickEvent);
	window.addEventListener("resize", windowResized);
};

const checkIfActive = () => {
	if (cursorPos === input.value.length) {
		input.blur();
		input.scrollTop = input.scrollHeight;
		return;
	}
	input.selectionStart = cursorPos;
	input.selectionEnd = cursorPos;
	input.focus();
};

const isMathSymbol = (c) => {
	return c == "+" || c == "-" || c == "\xD7" || c == "\xF7";
};

const removeFromStr = (str, start, end) => {
	end = end || start + 1;
	return str.slice(0, start) + str.slice(end);
};

const count = (str, char) => {
	return str.split(char).length - 1;
};

const validateInput = () => {
	let text = input.value;
	// if (text.startsWith("*") || text.startsWith("/") || text.startsWith(".")) {
	//   text = "0" + text;
	//   cursorPos++;
	//   // if curser is not at the end
	// } else
	if (text[cursorPos]) {
		// if curser is at the end
	} else {
		if (isMathSymbol(text[cursorPos - 2])) {
			if (isMathSymbol(text[cursorPos - 1])) {
				text = removeFromStr(text, cursorPos - 2);
				cursorPos--;
				// } else if (text[cursorPos - 1] == ".") {
				//   text = removeFromStr(text, cursorPos - 1);
				//   text += "0.";
				//   cursorPos++;
			} else if (text[cursorPos - 1] == ")") {
				if (count(text, "(") >= count(text, ")")) {
					text = removeFromStr(text, cursorPos - 2);
				} else {
					text = removeFromStr(text, cursorPos - 1);
				}
				cursorPos--;
			}
		}
	}
	input.value = text;
};

const getCompletedExpr = (expr) => {
	if (expr[expr.length - 1] === ".") {
		expr = removeFromStr(expr, expr.length - 1);
	}
	if (expr[expr.length - 1] === "(") {
		expr = removeFromStr(expr, expr.length - 1);
	}
	if (isMathSymbol(expr[expr.length - 1])) {
		expr = removeFromStr(expr, expr.length - 1);
	}

	for (let i = 0; i < count(expr, "(") - count(expr, ")"); i++) {
		expr += ")";
	}
	return expr;
};

const isTextSelected = () => {
	return input.selectionStart != input.selectionEnd;
};

const deleteSelected = () => {
	if (!isMobile() && isTextSelected) {
		cursorPos = input.selectionStart;
		input.value = removeFromStr(
			input.value,
			input.selectionStart,
			input.selectionEnd
		);
	}
};

const isExpr = (expr) => {
	return isNaN(expr) && isNaN(getCompletedExpr(expr));
};

const finalize = () => {
	input.value = getCompletedExpr(input.value);
	cursorPos = input.value.length;
	if (isExpr(input.value)) {
		main.classList.add("largeOutput");
		isFinalized = true;
		if (output.innerText == "") {
			output.innerText = "Syntax Error";
		}
		resizeInOutText();
	}
};

const unFinalize = () => {
	isFinalized = false;
	showError = false;
	main.classList.remove("largeOutput");
};

const clearAll = () => {
	input.value = "";
	cursorPos = 0;
	input.blur();
	main.classList.add("noOutput");
	output.innerText = "";
	unFinalize();
};

const clearBack = () => {
	unFinalize();
	if (isTextSelected()) {
		deleteSelected();
	} else if (cursorPos > 0) {
		input.value =
			input.value.slice(0, cursorPos - 1) + input.value.slice(cursorPos);
		cursorPos--;
	}
	checkInput();
};

const typeIt = (c) => {
	if (isTextSelected()) {
		deleteSelected();
	} else {
		if (isFinalized) {
			if (isMathSymbol(c)) {
				input.value = output.innerText;
				cursorPos = input.value.length;
			} else {
				clearAll();
			}
		}
	}
	unFinalize();
	input.value =
		input.value.slice(0, cursorPos) + c + input.value.slice(cursorPos);
	cursorPos++;
	checkInput();
};

const calculate = () => {
	try {
		const expr = getCompletedExpr(input.value)
			.replace(/\xD7/g, "*")
			.replace(/\xF7/g, "/");
		output.innerText = eval(expr) || "";
	} catch (error) {
		output.innerText = "";
	}
};

const showHideOutput = () => {
	if (isExpr(input.value)) {
		main.classList.remove("noOutput");
		calculate();
	} else {
		main.classList.add("noOutput");
	}
};

const checkInput = () => {
	checkIfActive();
	validateInput();
	showHideOutput();
	resizeInOutText();
};

const keyPressedEvent = (e) => {
	e.preventDefault();
	const pressedKey = e.key;
	let keyFound = false;
	keys.some((key) => {
		if (key.keyboardKey.includes(pressedKey)) {
			key.click();
			keyFound = true;
		}
		return keyFound;
	});
	if (!keyFound) {
		switch (pressedKey) {
			case "ArrowRight":
				if (cursorPos < input.value.length) {
					cursorPos++;
					input.selectionStart = cursorPos;
				}
				break;
			case "ArrowLeft":
				if (cursorPos > 0) {
					cursorPos--;
					input.selectionEnd = cursorPos;
					input.focus();
				}
				break;
			default:
				console.log(e);
				break;
		}
	}
};

const getTextWidth = (text, font) => {
	dummy = document.createElement("div");
	document.body.appendChild(dummy);

	dummy.style.font = font;
	dummy.style.fontSize = "100px";
	dummy.style.height = "auto";
	dummy.style.width = "auto";
	dummy.style.position = "absolute";
	dummy.style.whiteSpace = "nowrap";
	dummy.innerHTML = text;

	width = dummy.clientWidth;
	document.body.removeChild(dummy);
	return width;
};

const inputClickEvent = () => {
	if (!isMobile()) {
		cursorPos = input.selectionStart;
	}
};

const resizeInOutText = () => {
	resizeInputText();
	resizeOutputText();
};

const resizeInputText = () => {
	root.style.setProperty("--input-font", `${getDesiredElementFont(input)}px`);
};

const resizeOutputText = () => {
	root.style.setProperty("--output-font", `${getDesiredElementFont(output)}px`);
};

const getDesiredElementFont = (elem) => {
	const textWidth = getTextWidth(
		elem.value || elem.innerText,
		getPropValue(elem, "font")
	);

	const currentPadding = getPropValueInt(elem, "padding");
	const currentWidth = mainWidth - 2 * currentPadding;
	const newFontSize = (currentWidth * 95) / textWidth;
	const height = getPropValueInt(elem, "height") * 0.95;
	return Math.min(newFontSize, height);
};

init();
