// Import and require mysql2
const mysql = require('mysql2');
// Import console.table to allow the app to display tables in a neater format.
const cTable = require('console.table')
//Allows the .env file to actually work, and add a slight layer of security to the whole thing.
require('dotenv').config();
//Inquirer functionality
const inquirer = require("inquirer");

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  console.log(`Connected to the database.`)
);

//Note to future self: Study up on dynamically presenting Inquirer options. This seems like it will be required.
//Possible way to do it: A query to pull all the option-related data when the relevant prompts are created?



//TODO: Add all these options:
//All Departments - department names and department ids
function allDepartments(){
  db.promise().query('SELECT * FROM department')
  .then((res) => {
    console.table(res[0]);
    openMenu();
  })
}
//All Roles - job title, role id, the department that role belongs to, and the salary for that role
function allRoles(){
  db.promise().query('SELECT role.id, role.title AS job_title, role.salary, department.name as department_name FROM role JOIN department ON role.department_id = department.id')
  .then((res) => {
    console.table(res[0]);
    openMenu();
  })
}
//All Employees - employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to.
//Dear god why do join chains exist
function allEmployees(){
  db.promise().query('SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, department.name as department, role.salary, employee.manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id')
  .then((res) => {
    console.table(res[0]);
    openMenu();
  })
}
//Add Department - Inquirer prompt to add department name, and Query call to add Department
function addDepartment(){
  
}
//Add a Role - Inquirer prompt to add name, salary and department(possible to make dynamic inquirer based on departments?)
//And query call to add Role
function addRole(){

}
//Add Employee - Add first and last names, role and manager (may need dynamic inquirer again) and query call to, y'know.
function addEmployee(){

}
//Update Employee Role - Prompt to select employee, then select new role, then make call to update role.
function updateEmployee(){

}

function openMenu(){
  {
    inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
              "Display all departments",
              "Display all roles",
              "Display all employees",
              "Add new department",
              "Add a role",
              "Add an employee",
              "Update employee role",
              new inquirer.Separator(),
              "Quit application"
          ]
        }
      ])
      .then(val => {
        switch (val.choice) {
          case "Display all departments":
            allDepartments();
            break;
          case "Display all roles":
            allRoles();
            break;
          case "Display all employees":
            allEmployees();
            break;
          case "Add new department":
            addDepartment();
            break;
          case "Add a role":
            addRole();
            break;
          case "Add an employee":
            addEmployee();
            break;
          case "Update employee role":
            updateEmployee();
            break;
          case "Quit application":
            process.exit();
            break;
        }
    })
  }
}

console.log("Welcome to the Employee Tracker!\n\n")
openMenu();