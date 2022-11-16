const body = document.getElementsByTagName("body")[0];
const keyboard = document.getElementById("keyboard");
const input = document.getElementById("input");

const mainStyle = document.documentElement.style;
// mainStyle.setProperty("--button-font", "50px");

let cursorPos = 0;

const keys = [
  { text: "C", onClickEvent: "clearAll" },
  { text: "(", onClickEvent: "typeIt" },
  { text: ")", onClickEvent: "typeIt" },
  { text: "/", onClickEvent: "typeIt" },
  { text: "7", onClickEvent: "typeIt" },
  { text: "8", onClickEvent: "typeIt" },
  { text: "9", onClickEvent: "typeIt" },
  { text: "*", onClickEvent: "typeIt" },
  { text: "4", onClickEvent: "typeIt" },
  { text: "5", onClickEvent: "typeIt" },
  { text: "6", onClickEvent: "typeIt" },
  { text: "+", onClickEvent: "typeIt" },
  { text: "1", onClickEvent: "typeIt" },
  { text: "2", onClickEvent: "typeIt" },
  { text: "3", onClickEvent: "typeIt" },
  { text: "-", onClickEvent: "typeIt" },
  { text: "0", onClickEvent: "typeIt" },
  { text: "<", onClickEvent: "clearBack" },
  { text: ".", onClickEvent: "typeIt" },
  { text: "=", onClickEvent: "calculate" },
];

const keyTexts = keys
  .filter(key => key.onClickEvent == "typeIt")
  .map(({ text }) => text);

const init = () => {
  let button_id = 0;
  keys.forEach(key => {
    const newButton = document.createElement("button");
    newButton.setAttribute("button_id", button_id++);
    newButton.classList.add("button");
    newButton.innerText = key.text;
    newButton.setAttribute("onclick", key.onClickEvent + `("${key.text}")`);
    keyboard.appendChild(newButton);
  });

  body.addEventListener("keydown", keyPressedEvent);
  input.addEventListener("click", inputClickEvent);
};

const checkIfActive = () => {
  console.log(cursorPos);
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
  if (isTextSelected) {
    cursorPos = input.selectionStart;
    input.value =
      input.value.slice(0, input.selectionStart) +
      input.value.slice(input.selectionEnd);
  }
};

const clearAll = () => {
  input.value = "";
  cursorPos = 0;
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
  console.log("= was pressed!");
};

const checkInput = () => {
  checkIfActive();
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

const inputClickEvent = () => {
  cursorPos = input.selectionStart;
};

init();
