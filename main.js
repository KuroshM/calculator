const body = document.getElementsByTagName("body")[0];
const main = document.getElementById("main");
const input = document.getElementById("input");

const mainStyle = document.documentElement.style;
// mainStyle.setProperty("--button-font", "50px");

let cursorPos = 0;

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
  keys.push(new Key("equal", "=", "calculate()", "btn-color2"));
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
  window.addEventListener("resize", resizeInputText);
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

const isTextSelected = () => {
  return input.selectionStart != input.selectionEnd;
};

const deleteSelected = () => {
  if (!isMobile() && isTextSelected) {
    cursorPos = input.selectionStart;
    input.value =
      input.value.slice(0, input.selectionStart) +
      input.value.slice(input.selectionEnd);
  }
};

const clearAll = () => {
  input.value = "";
  cursorPos = 0;
  input.blur();
};

const clearBack = () => {
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
  }
  input.value =
    input.value.slice(0, cursorPos) + c + input.value.slice(cursorPos);
  cursorPos++;
  checkInput();
};

const calculate = () => {
  resizeInputText();

  console.log("= was pressed!");
};

const checkInput = () => {
  checkIfActive();
  resizeInputText();
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
        calculate();
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
  dummy.style.height = "auto";
  dummy.style.width = "auto";
  dummy.style.position = "absolute";
  dummy.style.whiteSpace = "no-wrap";
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

const resizeInputText = () => {
  const textWidth = getTextWidth(input.value, getPropValue(input, "font"));

  const currentFontSize = getPropValueInt(input, "font-size");
  const currentPadding = getPropValueInt(input, "padding");
  const currentWidth = input.clientWidth - 2 * currentPadding;
  let newFontSize = (currentFontSize * currentWidth * 0.95) / textWidth;
  const root = document.documentElement;
  const maxFontSize = getPropValueInt(root, "--input-max-font");
  const minFontSize = getPropValueInt(root, "--input-min-font");
  newFontSize = Math.min(maxFontSize, Math.max(newFontSize, minFontSize));

  root.style.setProperty("--input-font", "" + newFontSize + "px");
};

init();
