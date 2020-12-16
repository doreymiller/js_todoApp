// Todo List Assessment 239

//Main area
//Overview - Show all todo items or currently selected group of todo items, along with number counts,
// and allow for the creation, edit, completion and deletion of todo items.  Organize the todo items
// based on date and completed status.  Creating, editing and completing todos triggers a modal
// with form fields and buttons for saving and completing todos.

//Requirements
//- Clicking on 'Add new todo' link pops up the modal with empty fields and buttons for saving and marking as complete
//- The main area displays the currently selected group of todos.  The default value is 'All Todos'
//- Hovering over a todo item block highlights that todo.  Clicking on the highlighted area surrounding
//  the todo toggles the completed state of that todo.
//- The todo item displayed in the list has the format "{title} - {month/year}" or "{title} - No Due Date"
//- Hovering over a todo name highlights the text.
//- Clicking on todo name pops up modal with text fields filled in appropriately
// - Hovering over trash bin highlights it.  Clicking on the trash bin deletes the todo from the
//  server and updates the page: removes from list of todos in main area, changes count at top of
//  main area, updates nav area removing from lists and changing counts
//- Completed todos appear at the bottom of the list.  Active todos could be organized by creation
//  date (id) or due date...undecided
//- 

//Nav area
//Overview - Show selectable lists of todo items based on groupings of All or Completed and further
//separated lists based on due date, along with number counts for todos in group.  Selecting
//list items changes the state of the main area to show the todo items in that grouping

//Requirements
//- The nav area lists all todos according to groupings.  
//  The main groupings are: All Todos and Completed
//  Sub groupings are according to due date or 'No Due Date'
//- Corresponding counts for lists are displayed next to list title
//- Clicking on a todo group changes the display of the main area to show the 
//  todo items in that group

//Modal 
//Overview - The modal is the popup that allows you to create, edit and complete todo items.

//Requirements
//- New todos have fields empty with placeholder text
//- Fields include Title, drop down selects for day, month and year, and a text box for description
//- Buttons at the bottom are "Save" and "Mark As Complete"
//- Editing existing items has fields filled with corresponding data for that todo
//- Clicking "Save" button closes the modal and adds the new todo or updates existing todo to the server.
//  If adding a new todo, All Todos group is selected in the nav and displayed in the main
//  area along with the new item.  If editing a todo, the currently selected group retains
//  being selected in the nav and updates are displayed in the main area.
//- Todos must have a title.
//- Todo date is optional.  Default value is "No Due Date".  If todo does not have month and year
//  the default value will be used.
//- Clicking "Mark As Complete"
//  When adding a new item, pops up an alert window saying that it cannot be done
//  When clicking on an existing item, updates the server and both the main and nav
//  areas by adding a line through and moving the todo item to the bottom of the list
//  in the main area and to the Completed list in the nav area
//- Clicking anywhere outside the modal closes the modal

//Objects
//App
//Main Manager
//Nav Manager
//Todo Manager
//API Manager
//Modal Manager
//Todo List
//Todo

//Todo
//properties: title, day, month, year, description, completed (boolean)
//methods: 
//  init(args) - set properties
//  getter methods: title, day, month, year, description, completed
//  markComplete
//  markActive
//  toggleComplete

//TodoList
//properties: title (month/year or No Due Date), todos
//methods:
//  init(args) - create empty todos array and add passed in todo
//  getAllTodos - return todos list
//  getCompleted - return list of completed todos
//  getActive - return list of active todos
//  getTodoById(id) - find todo by id
//  removeTodo(id) - getTodoById(id) and remove from
//  addTodo(todo) - add to todos

//TodoManager
//properties: todoLists, currentList
//methods: 
//  init(todoData) - createTodos(todoData)
//  createTodos(todoData) - create new TodoLists from the todo data with addNewTodo()
//  getAllTodos() - return list of all todos from all the todoLists
//  getActiveTodos() - return list of todoLists with all active todos
//  getCompletedTodos() - return list of todoLists with all completed todos
//  getCurrentList() - if currentList is empty, set currentList to All Todos
//                     return currentList
//  setCurrentList(list) - set currentList
//  addNewTodo(data) - create new todo with data
//                     if todoList currently exists for new Todo, add to TodoList
//                     else create new TodoList with todo
//                     set currentList to All Todos
//                     call App updateUI()

//App
//methods:
//  init() - initialize Main, Nav, API, Modal
//  loadAllTodos() - call to APIManager to fetch all todos
//    then initialize TodoManager with todo data
//    then call MainManager and NavManager update()
//    then showAllTodos()
//  showAllTodos() - call to MainManager and NavManager to set current list to All Todos
//  updateUI() - call TodoManager getCurrentList
//               call updateWithCurrentList(todoList) for NavManager and MainManager

//MainManager
//properties: title, titleCount, newTodo, listContainer, listTemplate (Handlebars)
//methods:
//  init() - set interface elements as properties
//           call bind()
//  showAllTodos() - getAllTodos from TodoManager
//           sort based on completed
//           renderList(sortedList)
//  renderList(todoList) - pass in list to listTemplate and add to listContainer
//  bind() - add event listener to newTodo (addNewTodo())
//           add event listener to listContainer to handle clicks
//  addNewTodo() - call Modal to show()
//  editTodo() - call Modal to show(todo)
//  deleteTodo() - call API to delete todo
//                 then call TodoList removeTodo(id)
//                 then call App updateUI()
//  update() - get currentList from TodoManager
//             renderList(todoList)

//ModalManager
//properties: container, modalElement, form, saveButton, completeButton, currentTodo, formTitle, etc.
//methods:
//  init() - set interface elements as properties
//           call bind()
//  bind() - bind event listener to saveButton(saveTodo), completeButton(markComplete),
//           and container(hide)
//  saveTodo() - check if title field is complete, if not pop up alert window
//               pass in data object to APIManager saveTodo(data)
//               then close modal
//               then call TodoManager addNewTodo(data)
//  show(todo) - if todo is undefined, set form fields to empty with placeholder text
//               else set form fields to todo data and set currentTodo to todo
//  markComplete(todo) - then call Todo markComplete()
//                       call APIManager editTodo(id)
//                       then call App updateUI()
//                       then hide modal
//  hide() - hide modal container

//APIManager
//methods:
//  loadTodos() - loads all todos from server
//  deleteTodo(id) - delete todo from server
//  editTodo(id) - edit todo from server
//  addNewTodo(data) - add new todo to server

//NavManager
//properties: navContainer, navTemplate
//methods:
//  init() - set interface elements as properties
//           bind()
//  bind() - bind event listener to navContainer (setCurrentList)
//  update() - get currentList from TodoManager
//             get All Todos from TodoManager
//             get active todos from TodoManager
//             get completed todos from TodoManager
//             render nav using list data
//  setCurrentList(list) - set highlight state of nav list item and remove previous highlights