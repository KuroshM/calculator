const keyboard = document.getElementById("keyboard");
const input = document.getElementById("input");

const mainStyle = document.documentElement.style;
console.log(keyboard);
// mainStyle.setProperty("--button-font", "50px");

let cursorPos = 0;

const init = () => {
  const keys = [
    { text: "AC", onClickEvent: "clearAll()" },
    "(",
    ")",
    "/",
    7,
    8,
    9,
    "*",
    4,
    5,
    6,
    "+",
    1,
    2,
    3,
    "-",
    0,
    { text: "<==", onClickEvent: "clearBack()" },
    ".",
    { text: "=", onClickEvent: "evaluate()" },
  ];

  let button_id = 0;
  keys.forEach(key => {
    const newButton = document.createElement("button");
    newButton.setAttribute("button_id", button_id++);
    newButton.classList.add("button");
    const text = key.text || key;
    newButton.innerText = text;
    newButton.setAttribute("onclick", key.onClickEvent || `typeIt("${text}")`);
    keyboard.appendChild(newButton);
  });
};

const checkIfActive = () => {
  if (cursorPos === input.value.length) {
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
  } else {
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

const evaluate = () => {
  console.log("= was pressed!");
};

const checkInput = () => {
  checkIfActive();
};

init();
