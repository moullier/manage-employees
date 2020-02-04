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
    
//    printEmployeeInfo();
    mainLoop("View All Employees");

  });

  function printEmployeeInfo() {
    let q = `SELECT e.id, e.first_name, e.last_name,
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
    connection.query(q, function(err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        //console.log(res);
    
        console.table(res);
        repeat();
    });   
}

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
            ORDER BY Manager;`;
    
    connection.query(q, function(err, res) {
        if (err) throw err;
    
        console.table(res);
        repeat();
    });

}

function addEmployee() {
    let availableRoles = [];

    let q = "SELECT title FROM roles;";
    connection.query(q, function(err, res) {
        if (err) throw err;
    
        availableRoles = responseToArray(res);
        console.log(availableRoles);
        console.table(res);

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
                choices: availableRoles,
                name: "role"
            },
            {
                type: "input",
                message: "What is the employee's ID?",
                name: "id"
            }
        ])
        .then(function (response) {
    
        });
    });
}

// this converts a response from a mySQL query to an array of Strings
function responseToArray() {
    


}


function mainLoop(response) {
    console.log("Entering mainLoop with response: " + response);
    switch(response) {
        case "View All Employees":
            printEmployeeInfo();
            break;
        case "View All Employees By Manager":
            printEmployeesByManager();
            break;
        case "View All Employees By Department":
            printEmployeesByDepartment();
            break;
        case "Add Employee":
            addEmployee();
            break;
        case "Exit":
            break;
        default:
            console.log("Default case");
            break;
    }
    
}

function repeat(){
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        choices: ["View All Employees",
            "View All Employees By Manager",
            "View All Employees By Department",
            "Add Employee",
            "Add Role",
            "Add Department",
            "Exit"],
        name: "answer"        
    }).then(function(response) {
        if(response.answer == "Exit") {
            console.log("You're done!")
        } else {
            console.log(response.answer);
            mainLoop(response.answer);
        }
    });
}