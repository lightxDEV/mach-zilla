const taskName = document.getElementById("taskName");
const targetTime = document.getElementById("targetTime");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");

let tasks = JSON.parse(localStorage.getItem("machTasks")) || {};
let timers = {};

addBtn.addEventListener("click", addTask);

function save() {
  localStorage.setItem("machTasks", JSON.stringify(tasks));
}

function addTask() {
  const name = taskName.value.trim();
  const mins = Number(targetTime.value);

  if (!name || !mins) return alert("Fill all fields");

  const id = Date.now();
  const targetSeconds = mins * 60;

  tasks[id] = {
    id,
    name,
    targetSeconds,
    remaining: targetSeconds,
    used: 0,
    running: false,
    score: null
  };

  save();
  render();
  taskName.value = "";
  targetTime.value = "";
}

function startTask(id) {
  const task = tasks[id];
  if (task.running) return;

  task.running = true;

  timers[id] = setInterval(() => {
    task.remaining--;
    task.used++;

    if (task.remaining <= 0) stopTask(id);

    save();
    render();
  }, 1000);
}

function stopTask(id) {
  const task = tasks[id];
  clearInterval(timers[id]);
  delete timers[id];

  task.running = false;
  task.score = ((task.targetSeconds / task.used) * 10).toFixed(2);

  save();
  render();
}

function deleteTask(id) {
  clearInterval(timers[id]);
  delete tasks[id];
  save();
  render();
}

function format(sec) {
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function render() {
  taskList.innerHTML = "";

  Object.values(tasks).forEach(t => {
    const li = document.createElement("li");
    if (t.running) li.classList.add("running");

    li.innerHTML = `
      <strong>${t.name}</strong><br>
      ⏳ ${format(t.remaining)}<br>
      ⚡ Mach: 
      <span class="${t.score >= 10 ? "mach-high" : "mach-low"}">
        ${t.score ?? "--"}
      </span><br>
      <button class="start">Start</button>
      <button class="stop">Stop</button>
      <button class="delete">Delete</button>
    `;

    li.querySelector(".start").onclick = () => startTask(t.id);
    li.querySelector(".stop").onclick = () => stopTask(t.id);
    li.querySelector(".delete").onclick = () => deleteTask(t.id);

    taskList.appendChild(li);
  });
}

render();
