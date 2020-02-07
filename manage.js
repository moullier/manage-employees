// include dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

// global variables
let continueManaging = true;

// create connection to mySQL server
const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "bobo1029",
    database: "employee_db"
  });

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    
    mainLoop("View All Employees");

});


// print a list of all employees with employee info plus Role Title, Department and Manager
function printEmployeeInfo() {
    let empQuery = `SELECT e.id, e.first_name, e.last_name,
	        r.title AS 'Title', r.salary,
            d.name AS 'Department', 
            IFNULL(CONCAT(m.first_name, ' ', m.last_name), NULL) AS 'Manager'
            FROM
                employee e
            LEFT JOIN employee m ON 
                m.id = e.manager_id
            LEFT JOIN roles r ON
	            e.role_id = r.id
            LEFT JOIN department d ON
	            r.department_id = d.id;`;
    connection.query(empQuery, function(err, res) {
        if (err) throw err;
    
        console.table(res);
        repeat();
    });   
}

// print all employees sorted by which Manager they have
function printEmployeesByManager() {
    console.log("Print EEs by Manager");

    let q = `SELECT IFNULL(CONCAT(m.first_name, ' ', m.last_name), NULL) AS 'Manager',
            e.id, e.first_name, e.last_name,
	        r.title AS 'Title', r.salary,
            d.name AS 'Department'
            FROM
                employee e
            LEFT JOIN employee m ON 
                m.id = e.manager_id
            LEFT JOIN roles r ON
	            e.role_id = r.id
            LEFT JOIN department d ON
	            r.department_id = d.id
            ORDER BY Manager`;
    
    connection.query(q, function(err, res) {
        if (err) throw err;
    
        console.table(res);
        repeat();
    });

}


// inserts a new Employee into the employee table of the database
function addEmployee() {

    // get a list of all roles with ids
    let q = "SELECT title, id FROM roles ORDER BY id;";
    connection.query(q, function(err, res) {
        if (err) throw err;
  
        // create a list of only the role titles as strings to use with inquirer
        let roleList = res.map(el => el.title);
        //console.log(roleList);

        // get list of all other employees with ids in order to select the new employee's manager
        let managerQuery = `SELECT first_name, last_name, id FROM employee;`;
        connection.query(managerQuery, function(err, managerRes) {
            if (err) throw err;

            // map the response to an array of only manager name strings for use in inquirer
            let managerArray = managerRes.map(el => el.first_name + " " + el.last_name);

            // add the option for assigning no manager to the new employee
            managerArray.push("No Manager Assigned");
    
            // prompt user for information about the new employee
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the employee's first name?",
                    name: "f_name"
                },
                {
                    type: "input",
                    message: "What is the employee's last name?",
                    name: "l_name"
                },
                {
                    type: "list",
                    message: "What is the employee's role?",
                    choices: roleList,
                    name: "role"
                },
                {
                    type: "list",
                    message: "Who is the employee's manager",
                    choices: managerArray,
                    name: "emp_manager"
                }
            ])
            .then(function (response) {

                // use selected role title to get id for role
                let newRoleID = res.filter(function(obj) {
                    if(obj.title == response.role) {
                        return obj;
                    }
                });

                newRoleID = newRoleID[0].id;

                // get manager ID if a manager was selected for the new employee
                let newManagerID;

                // set id to -1 if no manager selected
                if(response.emp_manager == "No Manager Assigned") {
                    newManagerID = -1;
                } else {
                    newManagerID = managerRes.filter(function(obj) {
                        let manName = obj.first_name + " " + obj.last_name;
                        if(manName == response.emp_manager) {
                            return obj;
                        }
                    });
                    newManagerID = newManagerID[0].id;
                }

                // create INSERT query depending on whether the new employee has been assigned a manager or not
                let insertEEQuery;
                if(newManagerID == -1){
                    insertEEQuery = `INSERT INTO employee (first_name, last_name, role_id)
                    values ('${response.f_name}', '${response.l_name}', ${newRoleID});`;
                } else {
                    insertEEQuery= `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    values ('${response.f_name}', '${response.l_name}', ${newRoleID}, ${newManagerID});`;
                }

                // send INSERT statement to mySQL server, then call repeat function
                connection.query(insertEEQuery, function(err, newEERes) {
                    if (err) throw err;

                    repeat();
                });                

            });
        });
    });
}


// add a new Department to the department table of the database
// currently, does not check for duplicate names
function addDepartment() {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the new department's name?",
            name: "dept_name"
        }
    ])
    .then(function (response) {

        // create INSERT query for the department
        let insertDeptQuery = `INSERT INTO department (name) values ('${response.dept_name}');`;
        
        // send INSERT statement to mySQL server, then call repeat function
        connection.query(insertDeptQuery, function(err, res) {
            if (err) throw err;

            repeat();
        });                

    });
}

// add a new Role to the roles table of the database
// currently, does not check for duplicate names
function addRole() {

    let viewDepartmentsQuery = `SELECT id, name FROM department;`;
    connection.query(viewDepartmentsQuery, function(err, res) {
        if (err) throw err;

        let deptList = res.map(el => el.name);
        // console.log(deptList);
 
        inquirer.prompt([
            {
                type: "input",
                message: "What is the title of the new role?",
                name: "title"
            },
            {
                type: "list",
                message: "Which department is the role in?",
                choices: deptList,
                name: "dept"
            },
            {
                type: "number",
                message: "What is the annual salary of the new role?",
                name: "salary"
            }
        ])
        .then(function (response) {
    
            // get department ID from department that was selected by user
            let deptID = res.filter(function(obj) {
                if(obj.name == response.dept) {
                    return obj;
                }
            });
    
            deptID = deptID[0].id;
    
            // console.log(`deptID is ${deptID}`);
    
    
            // create INSERT query for the department
            let insertRoleQuery = `INSERT INTO roles (title, salary, department_id) values
            ('${response.title}', '${response.salary}', '${deptID}');`;
            
            // send INSERT statement to mySQL server, then call repeat function
            connection.query(insertRoleQuery, function(err, res) {
                if (err) throw err;
    
                repeat();
            });
        }); 
    });
}

// prints a list of all departments with ids
function viewDepartments() {

    let viewDepartmentsQuery = `SELECT id, name AS 'Department Name' FROM department;`;
    connection.query(viewDepartmentsQuery, function(err, res) {
        if (err) throw err;

        console.table(res);

        repeat();
    });  

}


// prints a list of all roles with id, title, salary and department name
// requires a JOIN of roles table to department table
function viewRoles() {

    let viewRolesQuery = `SELECT r.id as id, r.title as Title,
    r.salary AS Salary, d.\`name\` AS Department
    FROM roles r, department d
    WHERE r.department_id = d.id;`;
    connection.query(viewRolesQuery, function(err, res) {
        if (err) throw err;

        console.table(res);

        repeat();
    });  

}

// the user chooses a current employee, and assigns them a new role
function updateEmployeeRole() {

    // get list of all employees so that user can choose who to update
    let empQuery = `SELECT first_name, last_name, id FROM employee;`;
    connection.query(empQuery, function(err, empRes) {
        if (err) throw err;

        // map to an array of only employee names for use in inquirer prompt
        let empArray = empRes.map(el => el.first_name + " " + el.last_name);
        
        // get list of all roles so that user can select new role for employee
        let roleQuery = "SELECT title, id FROM roles ORDER BY id;";
        connection.query(roleQuery, function(err, res) {
            if (err) throw err;
    
            // map a lists of all roles for use in inquirer
            let roleList = res.map(el => el.title);

            // prompt user for information about employee getting new role
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee is getting a new role?",
                    choices: empArray,
                    name: "emp"
                },
                {
                    type: "list",
                    message: "What is the employee's new role?",
                    choices: roleList,
                    name: "role"
                }
            ])
            .then(function (response) {
                // use selected role title to get id for role
                let newRoleID = res.filter(function(obj) {
                    if(obj.title == response.role) {
                        return obj;
                    }
                });

                newRoleID = newRoleID[0].id;
                // console.log("The new role ID is " + newRoleID);

                // get ID of employee to update from their name
                let newEmpID = empRes.filter(function(obj) {
                    let empName = obj.first_name + " " + obj.last_name;
            
                    if(empName == response.emp) {
                        return obj;
                    }
                });

                newEmpID = newEmpID[0].id;
                // console.log("newEmpID = " + newEmpID);

                // create UPDATE query
                let updateQuery = `UPDATE employee SET role_id = ${newRoleID} WHERE id = ${newEmpID};`;
                
                connection.query(updateQuery, function(err, updateRes) {
                    if (err) throw err;

                console.log(`Role updated for ${response.emp}`);
                repeat();
                });
            });
        });
    });
}

// calculates total employee salary for a specified department
function viewDeptBudget() {

    // get list of all existing departments
    let viewDepartmentsQuery = `SELECT id, name FROM department;`;
    connection.query(viewDepartmentsQuery, function(err, res) {
        if (err) throw err;

        // create array of only departments from result of query
        let deptList = res.map(el => el.name);

        // prompt user for desired department using the list
        inquirer.prompt([
            {
                type: "list",
                message: "Which department's budget do you want to see?",
                choices: deptList,
                name: "dept"
            }
        ])
        .then(function (response){
            // get department id from department selected
            let deptID = res.filter(function(obj) {
                if(obj.name == response.dept) {
                    return obj;
                }
            });
    
            deptID = deptID[0].id;
    
            // console.log(`deptID is ${deptID}`);

            // create a query to get all employees in the specified department
            let budgetQuery = `SELECT r.salary
            FROM
                employee e
            LEFT JOIN roles r ON
	            e.role_id = r.id
            LEFT JOIN department d ON
                r.department_id = d.id WHERE r.department_id = ${deptID};`;
            
            connection.query(budgetQuery, function(err, budgetRes) {
                if (err) throw err;
            
                // add up total of all salaries in department
                let totalBudget = 0;

                budgetRes.forEach(element => {
                    totalBudget += element.salary;
                });
                
                console.log(`The total salary budget for the ${response.dept} department is $${totalBudget}`);

                repeat();
            });
        });
    });
}

// main switch logic, takes the user's selected menu option and calls the appropriate function
function mainLoop(response) {
    
    switch(response) {
        case "View All Employees":
            printEmployeeInfo();
            break;
        case "View All Employees By Manager":
            printEmployeesByManager();
            break;
        case "Add Employee":
            addEmployee();
            break;
        case "Add Role":
            addRole();
            break;
        case "Add Department":
            addDepartment();
            break;
        case "View All Departments":
            viewDepartments();
            break;
        case "View All Roles":
            viewRoles();
            break;
        case "Update Employee Role":
            updateEmployeeRole();
            break;
        case "View Department Budget":
            viewDeptBudget();
            break;
        case "Exit":
            console.log("Exiting...");
            connection.end();
            break;
        default:
            connection.end();
            break;
    }
    
}

// asks the user what they want to do next
function repeat(){
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        choices: ["View All Employees",
            "View All Employees By Manager",
            "Add Employee",
            "Add Role",
            "Add Department",
            "View All Roles",
            "View All Departments",
            "Update Employee Role",
            "View Department Budget",
            "Exit"],
        name: "answer"        
    }).then(function(response) {
        mainLoop(response.answer);
    });
}