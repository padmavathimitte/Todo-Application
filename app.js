const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    todo_id: dbObject.todoId,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

app.get("/todos/?status=TO%20DO", async (request, response) => {
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo;`;
  const todoArray = await database.all(getTodoQuery);
  response.send(
    todoArray.map((eachTodo) => convertDbObjectToResponseObject(eachTodo))
  );
});

app.get("/todos/?priority=HIGH", async (request, response) => {
  const getPriorityQuery = `
    SELECT
      *
    FROM
      todo;`;
  const priorityArray = await database.all(getPriorityQuery);
  response.send(
    priorityArray.map((eachPriority) =>
      convertDbObjectToResponseObject(eachPriority)
    )
  );
});

app.get(
  "/todos/?priority=HIGH&status=IN%20PROGRESS",
  async (request, response) => {
    const getStatusQuery = `
    SELECT
      *
    FROM
      todo;`;
    const statusArray = await database.all(getStatusQuery);
    response.send(
      statusArray.map((eachStatus) =>
        convertDbObjectToResponseObject(eachStatus)
      )
    );
  }
);

app.get("/todos/?search_q=Play", async (request, response) => {
  const getSearchQuery = `
    SELECT
      *
    FROM
      todo;`;
  const searchArray = await database.all(getSearchQuery);
  response.send(
    searchArray.map((eachSearch) => convertDbObjectToResponseObject(eachSearch))
  );
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getIdQuery = `
    SELECT 
      * 
    FROM 
      todo 
    WHERE 
      todo_id = ${todoId};`;
  const idQuery = await database.get(getIdQuery);
  response.send(convertDbObjectToResponseObject(idQuery));
});

app.post("/todos/", async (request, response) => {
  const { todoId, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (todo_id,todo,priority,status)
  VALUES
    (${todoId},'${todo}', '${priority}', '${status}');`;
  const newTodo = await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { status } = request.body;
  const { todoId } = request.params;
  const updateStatusQuery = `
  UPDATE
    todo
  SET
    status = '${status}',
    
  WHERE
    todoId = ${todoId};`;

  await database.run(updateStatusQuery);
  response.send("Status Updated");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
   todoId = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
