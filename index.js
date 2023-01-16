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
async function allDepartments(){
  const depData = await db.promise().query('SELECT * FROM department')
  console.table(depData[0]);
  openMenu();
}
//All Roles - job title, role id, the department that role belongs to, and the salary for that role
async function allRoles(){
  const roleData = await db.promise().query('SELECT role.id, role.title AS job_title, role.salary, department.name as department_name FROM role JOIN department ON role.department_id = department.id')
  console.table(roleData[0]);
  openMenu();
}
//All Employees - employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to.
//Dear god why do join chains exist
async function allEmployees(){
  const empData = await db.promise().query('SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, department.name as department, role.salary, employee.manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id')
  console.table(empData[0]);
  openMenu();
}
//Add Department - Inquirer prompt to add department name, and Query call to add Department
async function addDepartment(){
  const entry = await inquirer.prompt([
    {
        type: "input",
        name: "name",
        message: "Type in the name of the new department: "
    },
  ])
  const ping = await db.promise().query(`INSERT INTO department (name) VALUES ("${entry.name}")`)
  console.log(`\n${entry.name} department added!\n`)
  openMenu()
}
//Add a Role - Inquirer prompt to add name, salary and department, then a query call to add the role.
async function addRole(){
  const departments = []
  //Creates the department names as options in the inquirer prompt.
  const depData = await db.promise().query('SELECT name FROM department')
  depData[0].forEach(obj => {
    departments.push(obj.name)
  })
  const entries = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Type in the title of the new role: "
    },
    {
      type: "input",
      name: "salary",
      message: "What's the expected salary for the role in question? "
    },
    {
      type: "list",
      name: "department",
      message: "What Department does this role belong to? ",
      choices: departments
    },
  ])
  //Finds the department_id that the department belongs to, then saves it.
  const depId = await db.promise().query(`SELECT id FROM department WHERE name = ?`, entries.department)
  //Inserts all the data required into the database once they're all gathered.
  //I am so glad async functions exist... .then() chains are aggressively unwieldy.
  const ping = await db.promise().query(`INSERT INTO role (title, salary, department_id) VALUES ("${entries.title}", ${entries.salary}, ${depId[0][0].id})`)
  
  console.log(`\n${entries.title} role added!\n`)
  openMenu()
}
//Add Employee - Add first and last names, role and manager (may need dynamic inquirer again) and query call to, y'know.
async function addEmployee(){
  //Both role title and a list of employees are required, so pull both lists at the same time.
  const roles = []
  const employees = ['None']
  const roleData = await db.promise().query('SELECT role.title FROM role')
  const empData = await db.promise().query('SELECT employee.first_name, employee.last_name FROM employee')
  let empId = 0
  roleData[0].forEach(obj => {
    roles.push(obj.title)
  })
  empData[0].forEach(obj => {
    employees.push(obj.first_name + ' ' + obj.last_name)
  })
  const entries = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the new employee's first name?"
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the new employee's surname?"
    },
    {
      type: "list",
      name: "role",
      message: "What role does this new employee have?",
      choices: roles
    },
    {
      type: "list",
      name: "manager",
      message: "Who is this employee's manager, if any?",
      choices: employees
    }
  ])
  //Acquires the role id from the chosen role
  const roleId = await db.promise().query(`SELECT id FROM role WHERE title = ?`, entries.role)
  //If the employee has no manager, automatically sets the id to a null value.
  if (entries.manager === 'None'){
    empId = null;
  }
  //Otherwise, split the chosen name again and use them to find the corresponding id.
  else {
    const chosenName = entries.manager.split(' ')
    const singleEmpData = await db.promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, chosenName)
    empId = singleEmpData[0][0].id
  }
  //Finally, adds the new entry into the database.
  const ping = await db.promise().query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${entries.firstName}", "${entries.lastName}", ${roleId[0][0].id}, ${empId})`)
  console.log(`\nEmployee ${entries.firstName} ${entries.lastName} added!\n`)
  openMenu()
}

//Update Employee Role - Prompt to select employee, then select new role, then make call to update role.
async function updateEmployee(){
  //Pull down role and employee lists in preparation for Inquirer prompt
  const roles = []
  const employees = []
  const roleData = await db.promise().query('SELECT role.title FROM role')
  const empData = await db.promise().query('SELECT employee.first_name, employee.last_name FROM employee')
  roleData[0].forEach(obj => {
    roles.push(obj.title)
  })
  empData[0].forEach(obj => {
    employees.push(obj.first_name + ' ' + obj.last_name)
  })
  //
  const entries = await inquirer.prompt([
    {
      type: "list",
      name: "employee",
      message: "Select an employee to update: ",
      choices: employees
    },
    {
      type: "list",
      name: "role",
      message: "What is the employee's new role?",
      choices: roles
    }
  ])
  //Splits the chosen name, then acquires the employee ID from it.
  const chosenName = entries.employee.split(' ')
  const empId = await db.promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, chosenName)
  //Acquires the role id from the chosen role
  const roleId = await db.promise().query(`SELECT id FROM role WHERE title = ?`, entries.role)

  const ping = await db.promise().query(`UPDATE employee SET role_id = ${roleId[0][0].id} WHERE id = ${empId[0][0].id}`)
  console.log(`\nEmployee ${entries.employee} is now a ${entries.role}!\n`)
  openMenu()
}

async function openMenu(){
  {
    const entry = await inquirer.prompt([
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
    switch (entry.choice) {
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
  }
}

console.log("Welcome to the Employee Tracker!\n\n")
openMenu();