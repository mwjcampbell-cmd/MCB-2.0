// IndexedDB setup
let db;
const request = indexedDB.open("MattyDB", 4);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("workLogs")) {
    db.createObjectStore("workLogs", { keyPath: "id", autoIncrement: true });
  }
  if (!db.objectStoreNames.contains("tasks")) {
    db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadWorkLogs();
  loadTasks();
};

request.onerror = (event) => {
  console.error("DB error:", event.target.errorCode);
};

// Work Log handling
let editingWorkLogId = null;

document.getElementById("workForm").onsubmit = (e) => {
  e.preventDefault();
  const date = document.getElementById("workDate").value;
  const task = document.getElementById("workTask").value;
  const hours = document.getElementById("workHours").value;

  const tx = db.transaction("workLogs", "readwrite");
  const store = tx.objectStore("workLogs");

  if (editingWorkLogId) {
    store.put({ id: editingWorkLogId, date, task, hours });
  } else {
    store.add({ date, task, hours });
  }

  tx.oncomplete = () => {
    loadWorkLogs();
    e.target.reset();
    resetWorkForm();
  };
};

function loadWorkLogs() {
  const tx = db.transaction("workLogs", "readonly");
  const store = tx.objectStore("workLogs");
  const req = store.getAll();
  req.onsuccess = () => {
    const list = document.getElementById("workList");
    list.innerHTML = "";
    req.result.forEach(log => {
      const li = document.createElement("li");
      li.innerHTML = `${log.date}: ${log.task} (${log.hours}h)
        <button onclick="editWorkLog(${log.id})">✏️</button>
        <button onclick="deleteWorkLog(${log.id})">🗑️</button>`;
      list.appendChild(li);
    });
  };
}

function editWorkLog(id) {
  const tx = db.transaction("workLogs", "readonly");
  const store = tx.objectStore("workLogs");
  const req = store.get(id);
  req.onsuccess = () => {
    const log = req.result;
    if (!log) return;
    document.getElementById("workDate").value = log.date;
    document.getElementById("workTask").value = log.task;
    document.getElementById("workHours").value = log.hours;
    editingWorkLogId = log.id;
    document.querySelector("#workForm button[type='submit']").textContent = "Update Log";
  };
}

function deleteWorkLog(id) {
  if (!confirm("Are you sure you want to delete this work log?")) return;
  const tx = db.transaction("workLogs", "readwrite");
  const store = tx.objectStore("workLogs");
  store.delete(id);
  tx.oncomplete = () => loadWorkLogs();
}

function resetWorkForm() {
  editingWorkLogId = null;
  document.querySelector("#workForm button[type='submit']").textContent = "Add Log";
}

// Task handling
let editingTaskId = null;

document.getElementById("taskForm").onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("taskName").value;

  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  if (editingTaskId) {
    store.put({ id: editingTaskId, name });
  } else {
    store.add({ name });
  }

  tx.oncomplete = () => {
    loadTasks();
    e.target.reset();
    resetTaskForm();
  };
};

function loadTasks() {
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const req = store.getAll();
  req.onsuccess = () => {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    req.result.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `${task.name}
        <button onclick="editTask(${task.id})">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>`;
      list.appendChild(li);
    });
  };
}

function editTask(id) {
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const req = store.get(id);
  req.onsuccess = () => {
    const task = req.result;
    if (!task) return;
    document.getElementById("taskName").value = task.name;
    editingTaskId = task.id;
    document.querySelector("#taskForm button[type='submit']").textContent = "Update Task";
  };
}

function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  store.delete(id);
  tx.oncomplete = () => loadTasks();
}

function resetTaskForm() {
  editingTaskId = null;
  document.querySelector("#taskForm button[type='submit']").textContent = "Add Task";
}

// Section switching
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
