const root = document.documentElement;
const body = document.getElementsByTagName("body")[0];
const main = document.getElementById("main");
const input = document.getElementById("input");
const output = document.getElementById("output");
// const mainWidth = getPropValueInt(body, "width");

// const mainStyle = document.documentElement.style;
// mainStyle.setProperty("--button-font", "50px");

let cursorPos = 0;
let isFinalized = false;

class Key {
  constructor(name, text, onClickEvent, color) {
    this.name = name;
    this.text = text;
    this.onClickEvent = onClickEvent;
    this.color = color;
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
    { text: "*", name: "multiply" },
    { text: "/", name: "divide" },
  ].forEach(({ name, text }) => {
    keys.push(new Key(name, text, `typeIt(\"${text}\")`, "btn-color2"));
  });
  [
    { text: "(", name: "open" },
    { text: ")", name: "close" },
  ].forEach(({ name, text }) => {
    keys.push(new Key(name, text, `typeIt(\"${text}\")`, "btn-color2"));
  });
  keys.push(new Key("clear", "C", "clearAll()", "btn-color3"));
  keys.push(new Key("back", "<", "clearBack()", "btn-color3"));
  keys.push(new Key("equal", "=", "finalize()", "btn-color2"));
  return keys;
};

const keys = initKeys();

const keyTexts = keys
  .filter(key => key.onClickEvent.startsWith("typeIt"))
  .map(({ text }) => text);

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const init = () => {
  keys.forEach(key => {
    const newButton = document.createElement("button");
    // newButton.setAttribute("button_id", button_id++);
    newButton.classList.add("button");
    newButton.classList.add(key.color);
    newButton.innerText = key.text;
    newButton.setAttribute("onclick", key.onClickEvent);
    newButton.style.gridArea = key.name;
    main.appendChild(newButton);
  });

  if (isMobile()) {
    input.setAttribute("readonly", "readonly");
  }

  body.addEventListener("keydown", keyPressedEvent);
  input.addEventListener("click", inputClickEvent);
  window.addEventListener("resize", resizeInOutText);
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

const isMathSymbol = c => {
  return c == "+" || c == "-" || c == "*" || c == "/";
};

const removeFromStr = (str, start, end) => {
  end = end || start + 1;
  return str.slice(0, start) + str.slice(end);
};

const count = (str, char) => {
  return str.split(char).length - 1;
  // return (str.match(new RegExp(char, "g")) || []).length;
};

const validateInput = text => {
  if (text.startsWith("*") || text.startsWith("/") || text.startsWith(".")) {
    text = "0" + text;
    cursorPos++;
    // if curser is not at the end
  } else if (text[cursorPos]) {
    // if curser is at the end
  } else {
    if (isMathSymbol(text[cursorPos - 2])) {
      if (isMathSymbol(text[cursorPos - 1])) {
        text = removeFromStr(text, cursorPos - 2);
        cursorPos--;
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
  return text;
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

const finalize = () => {
  if (isNaN(input.value)) {
    input.value = getCompletedExpr(input.value);
    main.classList.add("largeOutput");
    resizeInOutText();
    isFinalized = true;
  }
};

const unFinalize = () => {
  isFinalized = false;
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

const typeIt = c => {
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

const getCompletedExpr = expr => {
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

const calculate = () => {
  try {
    output.innerText = eval(getCompletedExpr(input.value));
  } catch (error) {
    output.innerText = "Error";
  }
};

const showHideOutput = () => {
  if (isNaN(input.value)) {
    main.classList.remove("noOutput");
    calculate();
  } else {
    main.classList.add("noOutput");
  }
};

const checkInput = () => {
  checkIfActive();
  input.value = validateInput(input.value);
  showHideOutput();
  resizeInOutText();
};

const keyPressedEvent = e => {
  e.preventDefault();
  const key = e.key;
  if (keyTexts.includes(key)) {
    typeIt(key);
  } else {
    switch (key) {
      case "Escape":
        clearAll();
        break;
      case "Backspace":
        clearBack();
        break;
      case "=":
      case "Enter":
        finalize();
        break;
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

const getPropValue = (elem, prop) => {
  return getComputedStyle(elem).getPropertyValue(prop);
};

const getPropValueInt = (elem, prop) => {
  return parseInt(getPropValue(elem, prop));
};

const resizeInOutText = () => {
  resizeInputText();
  resizeOutputText();
};

const resizeInputText = () => {
  root.style.setProperty(
    "--input-font",
    "" + getDesiredElementFont(input) + "px"
  );
};

const resizeOutputText = () => {
  root.style.setProperty(
    "--output-font",
    "" + getDesiredElementFont(output) + "px"
  );
};

const mainWidth = getPropValueInt(input, "width");
const getDesiredElementFont = elem => {
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
