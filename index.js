// Import and require mysql2
const mysql = require('mysql2');
//Allows the .env file to actually work, and add a slight layer of security to the whole thing.
require('dotenv').config();

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



//TODO: Add function to open menu. Inquirer required!

//TODO: Add all these options:
//All Departments - formatted table showing department names and department ids

//All Roles - job title, role id, the department that role belongs to, and the salary for that role

//All Employees - formatted table showing employee data, 
//including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to

//Add Department - Inquirer prompt to add department name, and Query call to add Department

//Add a Role - Inquirer prompt to add name, salary and department(possible to make dynamic inquirer based on departments?)
//And query call to add Role

//Add Employee - Add first and last names, role and manager (may need dynamic inquirer again) and query call to, y'know.

//Update Employee Role - Prompt to select employee, then select new role, then make call to update role.


// Hardcoded query: DELETE FROM course_names WHERE id = 3;

db.query(`DELETE FROM course_names WHERE id = ?`, 3, (err, result) => {
  if (err) {
    console.log(err);
  }
  console.log(result);
});

// Query database
db.query('SELECT * FROM course_names', function (err, results) {
  console.log(results);
});