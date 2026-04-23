let currentUser = null;
let data = JSON.parse(localStorage.getItem("kanbanData")) || {};

// LOGIN
function login() {
  const user = document.getElementById("username").value;
  if (!user) return alert("Enter username");

  currentUser = user;

  if (!data[user]) {
    data[user] = { todo: [], inprogress: [], done: [] };
  }

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  render();
}

function logout() {
  location.reload();
}

// SAVE
function save() {
  localStorage.setItem("kanbanData", JSON.stringify(data));
}

// ADD TASK
function addTask(column) {
  const text = prompt("Task name:");
  const due = prompt("Due date (YYYY-MM-DD):");
  const priority = prompt("Priority: high / medium / low");

  if (!text) return;

  data[currentUser][column].push({
    id: Date.now(),
    text,
    due,
    priority
  });

  save();
  render();
}

// RENDER
function render() {
  ["todo", "inprogress", "done"].forEach(col => {
    const container = document.querySelector(`#${col} .task-list`);
    container.innerHTML = "";

    data[currentUser][col].forEach(task => {
      const div = document.createElement("div");
      div.className = `task ${task.priority}`;
      div.draggable = true;
      div.id = task.id;

      div.ondragstart = drag;

      div.innerHTML = `
        <b>${task.text}</b><br>
        <small>Due: ${task.due || "N/A"}</small>
        <br>
        <button onclick="deleteTask('${col}', ${task.id})">X</button>
      `;

      container.appendChild(div);
    });
  });

  updateAnalytics();
}

// DELETE
function deleteTask(column, id) {
  data[currentUser][column] =
    data[currentUser][column].filter(t => t.id !== id);

  save();
  render();
}

// DRAG
function drag(ev) {
  ev.dataTransfer.setData("id", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  const id = Number(ev.dataTransfer.getData("id"));
  const targetCol = ev.target.closest(".column").id;

  let sourceCol;

  ["todo", "inprogress", "done"].forEach(col => {
    data[currentUser][col].forEach(task => {
      if (task.id === id) sourceCol = col;
    });
  });

  const task = data[currentUser][sourceCol].find(t => t.id === id);

  data[currentUser][sourceCol] =
    data[currentUser][sourceCol].filter(t => t.id !== id);

  data[currentUser][targetCol].push(task);

  save();
  render();
}

// ANALYTICS
function updateAnalytics() {
  const todo = data[currentUser].todo.length;
  const prog = data[currentUser].inprogress.length;
  const done = data[currentUser].done.length;

  document.getElementById("total").innerText = todo + prog + done;
  document.getElementById("progressCount").innerText = prog;
  document.getElementById("doneCount").innerText = done;
}

// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
