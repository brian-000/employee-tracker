const cTable = require('console.table');
var inquirer = require('inquirer');
const express = require('express');
const apiRoutes = require('./apiRoutes');
const db = require('./db/connection');
//declaring the port or defaulting
const PORT = process.env.PORT || 3001;
//setting it equal to app
const app = express();
// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res) => {
  res.status(404).end();
});
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

db.connect(err => {
  if (err) throw err;
  app.listen(PORT, () => {
    userPrompt();
  });
});


const userPrompt = async () => {
  return inquirer.prompt([
    {
      type: "list",
      name: "nextSteps",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update employee role",

      ],
    },
  ])
    .then((answers) => {

      if (answers.nextSteps === "View all departments") {
        const sql = `SELECT * FROM department`;

        db.query(sql, (err, rows) => {
          if (err) throw err;
          console.table(rows);
          // returns to initial prompt

          userPrompt();
        });
      }
      if (answers.nextSteps === 'View all roles') {
        viewAllRoles();

      }
      if (answers.nextSteps === 'View all employees') {
        viewAllEmployees();
      }

      if (answers.nextSteps === 'Add a department') {
        addADepartment();
      }

      if (answers.nextSteps === 'Add a role') {
        addARole();
      }

      if (answers.nextSteps === 'Add an employee') {
        addAnEmployee();
      }

      if (answers.nextSteps === 'Update employee role') {
        updateEmployeeRole();
      }

    })

}

viewAllRoles = () => {
  // pulls role information and brings over department names from id keys
  const sql = `SELECT 
                roles.title,
                roles.id,
                department.name AS department_id,
                roles.salary
              FROM roles
                LEFT JOIN department
                ON roles.department_id = department.id`;
  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};


/*
GIVEN a command-line application that accepts user input
WHEN I start the application
THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
WHEN I choose to view all departments
THEN I am presented with a formatted table showing department names and department ids
WHEN I choose to view all roles
THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
WHEN I choose to view all employees
THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
WHEN I choose to add a department
THEN I am prompted to enter the name of the department and that department is added to the database
WHEN I choose to add a role
THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
WHEN I choose to add an employee
THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
WHEN I choose to update an employee role
THEN I am prompted to select an employee to update and their new role and this information is updated in the database
*/