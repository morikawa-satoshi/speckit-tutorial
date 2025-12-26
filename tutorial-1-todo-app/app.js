(() => {
  const STORAGE_KEY = "todo-app-tasks";
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

  const state = {
    tasks: [],
    filter: "all", // all | active | completed
    priorityFilter: "all", // all | high | medium | low
    sort: "createdAt", // createdAt | priority
    storageAvailable: true,
  };

  // DOM Elements
  const form = document.getElementById("todo-form");
  const input = document.getElementById("task-input");
  const prioritySelect = document.getElementById("priority-select");
  const taskList = document.getElementById("task-list");
  const countEl = document.getElementById("count");
  const errorEl = document.getElementById("error");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const priorityFilterButtons = Array.from(document.querySelectorAll("[data-priority-filter]"));
  const sortButtons = Array.from(document.querySelectorAll("[data-sort]"));

  function isLocalStorageAvailable() {
    try {
      const testKey = "__speckit_todo_test__";
      localStorage.setItem(testKey, "ok");
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    if (!isLocalStorageAvailable()) {
      state.storageAvailable = false;
      showError("localStorageが利用できません。データは保存されません。", 5000);
      return [];
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Invalid data");
      return parsed.map((t) => normalizeTask(t)).filter(Boolean);
    } catch (e) {
      showError("保存データが壊れていたためリセットしました。", 4000);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  function save() {
    if (!state.storageAvailable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (e) {
      showError("保存に失敗しました。ストレージ容量を確認してください。", 4000);
    }
  }

  function normalizeTask(task) {
    if (!task || typeof task !== "object") return null;
    const text = typeof task.text === "string" ? task.text.trim() : "";
    if (!text) return null;
    const priority = sanitizePriority(task.priority);
    return {
      id: task.id ?? generateId(),
      text,
      completed: Boolean(task.completed),
      createdAt: Number(task.createdAt) || Date.now(),
      priority,
    };
  }

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function sanitizePriority(value) {
    return ["high", "medium", "low"].includes(value) ? value : "medium";
  }

  function addTask(text, priority) {
    const trimmed = text.trim();
    const validPriority = sanitizePriority(priority);
    if (!trimmed) {
      showError("空のタスクは追加できません。", 2500);
      return;
    }
    if (trimmed.length > 200) {
      showError("200文字以内で入力してください。", 2500);
      return;
    }

    state.tasks.unshift({
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority: validPriority,
    });

    save();
    render();
    clearInput();
  }

  function toggleTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    save();
    render();
  }

  function deleteTask(id) {
    const next = state.tasks.filter((t) => t.id !== id);
    state.tasks = next;
    save();
    render();
  }

  function getFilteredTasks() {
    let result = state.tasks;

    if (state.filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (state.filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (state.priorityFilter !== "all") {
      result = result.filter((t) => t.priority === state.priorityFilter);
    }

    const sorted = [...result];
    if (state.sort === "createdAt") {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (state.sort === "priority") {
      sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt - a.createdAt);
    }

    return sorted;
  }

  function render() {
    renderFilters();
    renderTasks();
    renderCount();
  }

  function renderFilters() {
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === state.filter;
      btn.setAttribute("aria-pressed", active);
    });
    priorityFilterButtons.forEach((btn) => {
      const active = btn.dataset.priorityFilter === state.priorityFilter;
      btn.setAttribute("aria-pressed", active);
    });
    sortButtons.forEach((btn) => {
      const active = btn.dataset.sort === state.sort;
      btn.setAttribute("aria-pressed", active);
    });
  }

  function renderTasks() {
    taskList.innerHTML = "";
    const tasks = getFilteredTasks();

    if (tasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "task-item";
      empty.textContent = "タスクがありません";
      taskList.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;
      li.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", "完了状態を切り替え");
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const text = document.createElement("p");
      text.className = "task-text";
      text.textContent = task.text;

      const badge = document.createElement("span");
      badge.className = `priority ${task.priority}`;
      badge.textContent = priorityLabel(task.priority);

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.setAttribute("aria-label", "タスクを削除");
      del.textContent = "✕";
      del.addEventListener("click", () => deleteTask(task.id));

      li.append(checkbox, text, badge, del);
      fragment.appendChild(li);
    });

    taskList.appendChild(fragment);
  }

  function renderCount() {
    const active = state.tasks.filter((t) => !t.completed).length;
    countEl.textContent = `未完了: ${active} 件`;
  }

  function priorityLabel(priority) {
    switch (priority) {
      case "high":
        return "高";
      case "low":
        return "低";
      default:
        return "中";
    }
  }

  function clearInput() {
    input.value = "";
    prioritySelect.value = "medium";
    input.focus();
  }

  function showError(message, duration = 2000) {
    errorEl.textContent = message;
    if (duration > 0) {
      setTimeout(() => {
        if (errorEl.textContent === message) {
          errorEl.textContent = "";
        }
      }, duration);
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    addTask(input.value, prioritySelect.value);
  }

  function handleFilterClick(event) {
    const target = event.target.closest("[data-filter]");
    if (!target) return;
    const value = target.dataset.filter;
    if (value === state.filter) return;
    state.filter = value;
    render();
  }

  function handlePriorityFilterClick(event) {
    const target = event.target.closest("[data-priority-filter]");
    if (!target) return;
    const value = target.dataset.priorityFilter;
    if (value === state.priorityFilter) return;
    state.priorityFilter = value;
    render();
  }

  function handleSortClick(event) {
    const target = event.target.closest("[data-sort]");
    if (!target) return;
    const value = target.dataset.sort;
    if (value === state.sort) return;
    state.sort = value;
    render();
  }

  function init() {
    state.tasks = load();
    render();

    form.addEventListener("submit", handleFormSubmit);
    filterButtons.forEach((btn) => btn.addEventListener("click", handleFilterClick));
    priorityFilterButtons.forEach((btn) => btn.addEventListener("click", handlePriorityFilterClick));
    sortButtons.forEach((btn) => btn.addEventListener("click", handleSortClick));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
