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
  ]).then((answers) => {
    if (answers.nextSteps === "View all departments") {
      const sql = `SELECT * FROM department`;
      db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
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

viewAllEmployees = () => {
  const sql = `SELECT 
                employees.id, 
                employees.first_name, 
                employees.last_name,
                roles.title, 
                department.name AS departments, 
                roles.salary, 
                CONCAT (manager.first_name, ' ' , manager.last_name) AS manager
              FROM employees
                LEFT JOIN roles
                ON employees.role_id = roles.id
                LEFT JOIN department
                ON roles.department_id = department.id
                LEFT JOIN employees manager ON employees.manager_id = manager.id`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });


};

addADepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newDepartment',
      message: `What's the name of the new Department?`,
      validate: newDepartment => {
        if (newDepartment) {
          return true;
        } else {
          console.log('Error');
          return false;
        }
      }
    }
  ]).then(answer => {
    const sql = `INSERT INTO department (name) VALUES (?)`;
    db.query(sql, answer.newDepartment, (err, result) => {
      if (err) throw err;
      console.log('New Department added');
      userPrompt();
    });
  });
};


addARole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newRole',
      message: 'Enter name for new role.',
      validate: newRole => {
        if (newRole) {
          return true;
        } else {
          console.log('error');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter salary for this role.',
      validate: salary => {
        if (isNaN(salary)) {
          console.log('error');
          return false;
        } else {
          return true;
        }
      }
    }
  ]).then(answer => {
    const params = [answer.newRole, answer.salary];
    const roleSql = `SELECT name, id FROM department`;
    db.query(roleSql, (err, data) => {
      if (err) throw err;
      const dept = data.map(({ name, id }) => ({ name: name, value: id }));
      inquirer.prompt([
        {
          type: 'list',
          name: 'dept',
          message: "Enter department for new role.",
          choices: dept
        }
      ]).then(deptChoice => {
        const dept = deptChoice.dept;
        params.push(dept);
        const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;
        db.query(sql, params, (err, result) => {
          if (err) throw err;
          console.log('Successfelly added');
          userPrompt();
        })
      })
    })
  })
}

addAnEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'employeeFirstName',
      message: `Enter employees first name.`,
      validate: employeeFirstName => {
        if (employeeFirstName) {
          return true;
        } else {
          console.log('error');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'employeeLastName',
      message: `Enter employees last name`,
      validate: employeeLastName => {
        if (employeeLastName) {
          return true;
        } else {
          console.log('error');
          return false;
        }
      }
    }
  ]).then(answer => {
    const employeeData = [answer.employeeFirstName, answer.employeeLastName]
    const updatedRole = `SELECT roles.id, roles.title FROM roles`;
    db.query(updatedRole, (error, data) => {
      if (error) throw error;
      const roles = data.map( ( {id, title} ) => ( {name: title, value: id } ) );
      inquirer.prompt([
        {
          type: 'list',
          name: 'employeeRole',
          message: "enter employees role.",
          choices: roles
        }
      ]).then(roleChoice => {
        const chosenRole = roleChoice.role;
        employeeData.push(chosenRole);
        const updateManager = `SELECT * FROM employees`;
        db.query(updateManager, (error, data) => {
          if (error) throw error;
          // gets managers from employee list
          const managers = data.map( ( {id, first_name, last_name} ) => ( { name: first_name + " " + last_name, value: id} ) );
          inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Enter employees manager",
              choices: managers
            }
          ]).then(managerChoice => {
            const chosenManager = managerChoice.manager;
            // pushes manager info into array containing new employee info
            employeeData.push(chosenManager);
            const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
            db.query(sql, employeeData, (error) => {
              if (error) throw error;
              console.log("Employee successfully added.")
              userPrompt();
            });
          });
        });
      });
    });
  });
};;






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