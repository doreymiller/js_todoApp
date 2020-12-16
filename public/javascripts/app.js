// Todo List Assessment 239

const App = {
  loadAllTodos() {
    APIManager.loadTodos()
      .then(response => response.json())
      .then(data => TodoManager.init(data))
      .then(() => NavManager.update())
      .then(() => MainManager.update());
  },

  updateUI() {
    MainManager.update();
    NavManager.update();
  },

  init() {
    MainManager.init();
    ModalManager.init();
    NavManager.init();
    this.loadAllTodos();
  }
};

const NavManager = {
  update() {
    let allTodos = TodoManager.getFlattenedList();
    let todoLists = TodoManager.getAllTodos();

    let processList = function(selectFunc) {
      return todoLists.map((list, idx) => {
        return { title: list.getTitle(), listLength: selectFunc.call(list).length, idx};
      }).filter(obj => obj.listLength > 0);
    };

    let activeLists = processList(TodoList.getActive);
    let completedLists = processList(TodoList.getCompleted);
    
    let total = allTodos.length;
    let completedTotal = allTodos.filter(todo => todo.getCompleted()).length;
    let navObj = { total, activeLists, completedLists, completedTotal };
    
    this.renderNav(navObj);

    document.querySelector(`#${this.selectedNav}`).classList.add('selected');
  },

  selectAllTodos() {
    this.setNavSelectGroup(this.ACTIVE_STATE);
    this.setNavSelectById("all_todos");
    MainManager.setShowAll(true);
  },

  renderNav(navData) {
    let html = this.navTemplate(navData);
    this.container.innerHTML = html;
  },

  getNavSelectGroup() { return this.navSelectGroup },
  setNavSelectGroup(listGroup) { this.navSelectGroup = listGroup },
  setNavSelectById(navElementId) { this.selectedNav = navElementId },

  selectGroup(listGroup, navElementId) {
    MainManager.setShowAll(true);
    this.setNavSelectGroup(listGroup);
    this.setNavSelectById(navElementId);
  },

  handleNavEvent(e) {
    e.preventDefault();

    if (e.target === document.querySelector("#all_todos")) {
      this.selectGroup(this.ACTIVE_STATE, e.target.id);
    } else if (e.target === document.querySelector("#completed_todos")) {
      this.selectGroup(this.COMPLETED_STATE, e.target.id);
    } else {
      let targetLi = e.target.closest("li");
      let listIdx = targetLi.dataset["id"];
  
      this.setNavSelectById(targetLi.id);
  
      if (/active_list_*/.test(targetLi.id)) {
        this.navSelectGroup = this.ACTIVE_STATE;
      } else if (/completed_list_*/.test(targetLi.id)) {
        this.navSelectGroup = this.COMPLETED_STATE;
      }

      MainManager.setShowAll(false);
      TodoManager.setCurrentList(listIdx);
    }
   
    App.updateUI();
  },

  bind() {
    this.container.addEventListener("click", this.handleNavEvent.bind(this));
  },

  init() {
    this.ACTIVE_STATE = "active";
    this.COMPLETED_STATE = "completed";
    this.container = document.querySelector("header");
    this.navTemplate = Handlebars.compile(document.querySelector("#nav_template").innerHTML);
    this.selectAllTodos();
    this.bind();
  }
};

const MainManager = {
  showModal(e) {
    e.preventDefault();
    ModalManager.show();
  },

  setShowAll(showAll) { this.showAll = showAll },

  showAllTodos() {
    let todoLists = TodoManager.getAllTodos();
    let activeTodos = [];
    let completedTodos = [];
    let listTitle = NavManager.getNavSelectGroup() === NavManager.ACTIVE_STATE 
                    ? "All Todos"
                    : "Completed";

    todoLists.forEach(todoList => {
      if (NavManager.getNavSelectGroup() === NavManager.ACTIVE_STATE) {
        activeTodos.push(todoList.getActive());
      }
      completedTodos.push(todoList.getCompleted());
    });

    let allTodos = activeTodos.concat(completedTodos).flat();
    this.renderList(allTodos, listTitle);
  },

  showCurrentList() {
    let todoList = TodoManager.getCurrentList();
    let listGroup = NavManager.getNavSelectGroup();
    let filteredList;

    if (listGroup === NavManager.ACTIVE_STATE) {
      filteredList = todoList.getActive();
    } else if (listGroup === NavManager.COMPLETED_STATE) {
      filteredList = todoList.getCompleted();
    }

    this.renderList(filteredList, todoList.getTitle());
  },

  renderList(todoList, title) {
    let html = this.listTemplate({todos: todoList, title: title});
    this.listContainer.innerHTML = html;
    this.newTodo = document.querySelector("#new_todo_container > a");
  },

  update() {
    this.showAll ? this.showAllTodos() : this.showCurrentList();
  },

  handleListEvent(e) {
    e.preventDefault();

    if (e.target === this.newTodo) {
      this.showModal(e);
    } else {
      let td = e.target.closest("td");
      let dataId = Number(td.dataset.id);
  
      if (/delete_*/.test(td.id)) {
        TodoManager.removeTodo(dataId);
      } else if (e.target.tagName === "LABEL") {
        ModalManager.show(dataId);
      } else if (/item_*/.test(td.id)) {
        TodoManager.toggleTodoComplete(dataId);
      } 
    }
  },

  bind() {
    this.listContainer.addEventListener("click", this.handleListEvent.bind(this));
  },

  init() {
    this.listContainer = document.querySelector("#main_list_container");
    this.listTemplate = Handlebars.compile(document.querySelector("#todo_list_template").innerHTML);
    this.showAll = true;

    this.bind();
  }
};

const ModalManager = {
  show(todoId) {
    this.currentTodo = todoId ? TodoManager.getTodoById(todoId) : null;
    
    if (this.currentTodo) {
      this.form.querySelector("#title").value = this.currentTodo.getTitle();
      this.form.querySelector("#day").value = this.currentTodo.getDay();
      this.form.querySelector("#month").value = this.currentTodo.getMonth();
      this.form.querySelector("#year").value = this.currentTodo.getYear();
      this.form.querySelector("#description").value - this.currentTodo.getDescription();
    } 

    this.container.classList.remove("hide");
    this.container.classList.add("show");
  },

  hide() {
    this.container.classList.remove("show");
    this.container.classList.add("hide");
    this.form.reset();
    this.currentTodo = null;
  },

  saveTodo(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.validForm()) {
      let formData = this.createFormDataObj();

      if (this.currentTodo) {
        formData.id = this.currentTodo.getId();
        TodoManager.updateTodo(formData);
      } else {
        NavManager.selectAllTodos();
        TodoManager.createNewTodo(formData);
      }

      this.hide();
    } else {
      alert('You must include a title.');
    }
  },

  createFormDataObj() {
    let formData = {};
    formData["title"] = this.form.querySelector("#title").value;
    formData["day"] = this.form.querySelector("#day").value;
    formData["month"] = this.form.querySelector("#month").value;
    formData["year"] = this.form.querySelector("#year").value;
    formData["description"] = this.form.querySelector("#description").value;

    return formData;
  },

  markComplete(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.currentTodo) {
      TodoManager.markTodoComplete(this.currentTodo);
      this.hide();
    } else {
      alert("this action cannot be completed until your todo has been saved.");
    }
  },

  validForm() {
    let inputs = this.form.querySelectorAll("input");
    return [...inputs].filter(input => input.validity.valid).length
      === inputs.length;
  },

  bind() {
    this.container.addEventListener("click", this.hide.bind(this));
    this.modalUI.addEventListener("click", e => e.stopPropagation());
    this.saveButton.addEventListener("click", this.saveTodo.bind(this));
    this.completeButton.addEventListener("click", this.markComplete.bind(this));
  },

  init() {
    this.container = document.querySelector("#modal_container");
    this.modalUI = document.querySelector("#modal");
    this.saveButton = document.querySelector("#save_button");
    this.completeButton = document.querySelector("#complete_button");
    this.form = document.querySelector("#modal > form");

    this.bind();
  }
};

const TodoManager = {
  addNewTodoData(data) {
    let todo = Object.create(Todo).init(data);
    let todoList = this.findMatchingList(todo);

    if (todoList) {
      todoList.addTodo(todo);
    } else {
      todoList = Object.create(TodoList).init(todo);
      this.todoLists.push(todoList);
    }
  },

  setCurrentList(listIdx) { this.currentList = this.todoLists[listIdx] },
  getCurrentList() { return this.currentList },

  createTodoLists(data) {
    [...data].forEach(todoData => {
      this.addNewTodoData(todoData);
    });
  },

  createNewTodo(formData) {
    APIManager.createTodo(formData)
        .then(response => response.json())
        .then(data => this.addNewTodoData(data))
        .then(() => App.updateUI());
  },

  getAllTodos() {
    return this.todoLists;
  },

  findMatchingList(todo) {
    let title = this.constructListTitle(todo);
    return this.todoLists.find(list => list.getTitle() === title);
  },

  getFlattenedList() {
    let allTodos = [];
    this.todoLists.forEach(list => allTodos.push(list.getAll()));
    return allTodos.flat();
  },

  removeTodo(id) {
    APIManager.deleteTodo(id)
      .then(response => console.log(response))
      .then(() => {
        let todo = this.getTodoById(id);
        todo.getTodoList().removeTodo(todo);
      })
      .then(() => App.updateUI());
  },

  markTodoComplete(todo) {
    todo.markComplete();
    APIManager.updateTodo(this.todoToJSON(todo))
      .then(response => response.json())
      .then(data => this.updateTodo(data))
      .then(() => App.updateUI());
    
  },

  updateTodo(todoData) {
    let todo = this.getTodoById(todoData.id);
    todo.update(todoData);
  },

  todoToJSON(todo) {
    return {
      title: todo.getTitle(),
      day: todo.getDay(),
      month: todo.getMonth(),
      year: todo.getYear(),
      description: todo.getDescription(),
      completed: todo.getCompleted(),
      id: todo.getId()
    }
  },

  toggleTodoComplete(id) {
    let todo = this.getTodoById(id);
    todo.toggleComplete();
    APIManager.updateTodo(this.todoToJSON(todo))
      .then(response => response.json())
      .then(data => this.updateTodo(data))
      .then(() => App.updateUI());
  },

  getTodoById(id) {
    return this.getFlattenedList().find(todo => todo.getId() === id);
  },

  init(data) {
    this.todoLists = [];
    this.allTodos = [];
    this.createTodoLists(data);
  },

  constructListTitle(todo) {
    let day = todo.getDay();
    let month = todo.getMonth();
    let title = (day && month) ? `${day}/${month}` : "No Due Date"; 

    return title;
  }
};

const TodoList = {
  addTodo(todo) {
    this.todos.push(todo);
    todo.setTodoList(this);
    todo.setListTitle();
  },
  
  removeTodo(todo) {
    let idx = this.todos.indexOf(todo);
    this.todos.splice(idx, 1);
  },

  setTitle(todo) { this.title = TodoManager.constructListTitle(todo) },
  getActive() { return this.todos.filter(todo => !todo.getCompleted()) },
  getCompleted() { return this.todos.filter(todo => todo.getCompleted()) },
  getAll() { return this.todos },
  getTitle() { return this.title },

  init(todo) {
    this.todos = [];
    this.setTitle(todo);
    this.addTodo(todo);
    
    return this;
  }
};

const Todo = {
  getTitle() { return this.title },
  getDay() { return this.day },
  getMonth() { return this.month },
  getYear() { return this.year },
  getDescription() { return this.description },
  getCompleted() { return this.completed },
  toggleComplete() { this.completed = !this.completed },
  markComplete() { this.completed = true },
  getId() { return this.id },
  setTodoList(todoList) { this.todoList = todoList },
  getTodoList() { return this.todoList },

  setListTitle() { 
    this.listTitle = `${this.title} - ${this.todoList.getTitle()}`; 
  },

  update(data) {
    this.title = data.title;
    this.day = data.day;
    this.month = data.month;
    this.year = data.year;
    this.completed = data.completed;
    this.description = data.description;
  },

  init(data) {
    this.id = data.id;
    this.update(data);
    
    return this;
  }
};

const APIManager = {
  async loadTodos() {
    let response = await fetch('/api/todos', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    return response;
  },

  async createTodo(todoData) {
    let response = await fetch('/api/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(todoData)
    });
    return response;
  },

  async updateTodo(todoData) {
    let response = await fetch(`api/todos/${todoData.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(todoData)
    });
    return response;
  },

  async deleteTodo(id) {
    let response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'}
    });
    return response;
  }
};

document.addEventListener("DOMContentLoaded", e => {
  App.init();
});

