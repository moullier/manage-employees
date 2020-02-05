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
            WHERE m.first_name = 'Royce' AND m.last_name = 'McGill';`;
    
    connection.query(q, function(err, res) {
        if (err) throw err;
    
        console.table(res);
        repeat();
    });

}

function addEmployee() {
    let availableRoles = [];

    let q = "SELECT title, id FROM roles ORDER BY id;";
    connection.query(q, function(err, res) {
        if (err) throw err;
  
        console.log("***" + res);
        let roleList = res.map(el => el.title);
        console.log(roleList);

        // make list of roles to use in inquirer
/*        for(let i = 0; i < res.length; i++) {
            console.log(res[i].title);
            availableRoles.push(res[i].title)
        }
*/

/*      let managerQuery = `SELECT DISTINCT e.manager_id, m.first_name, m.last_name 
        FROM employee e
        LEFT JOIN employee m
        ON (e.manager_id IS NOT NULL) AND (e.manager_id = m.id);`;
*/

        let managerQuery = `SELECT first_name, last_name, id FROM employee;`;
        connection.query(managerQuery, function(err, managerRes) {
            if (err) throw err;

            let managerArray = managerRes.map(el => el.first_name + " " + el.last_name);
            console.log(managerArray);

/*            for(let j = 0; j < managerRes.length; j++) {
                console.log(managerRes[j].Name);
                if(managerRes[j].Name != null) {
                    // let str = managerRes[j].first_name.concat(" " + managerRes[j].last_name);
                    managerArray.push(managerRes[j].Name);
                }
                
            }
            */

            managerArray.push("No Manager Assigned");
            console.log("MANAGER ARRAY = " + managerArray);
            console.log("MANAGER ARRAY[0] = " + managerArray[0]);

//            console.log(availableRoles);
//            console.table(res);
    
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
                
                console.log("response.emp_manager = " + response.emp_manager);

                if(response.emp_manager == "No Manager Assigned") {
                    newManagerID = -1;
                } else {
                    newManagerID = managerRes.filter(function(obj) {
                        console.log(obj);
                        let manName = obj.first_name + " " + obj.last_name;
                        console.log("manName = " + manName);
                        if(manName == response.emp_manager) {
                            return obj;
                        }
                    });
                    newManagerID = newManagerID[0].id;
                }

                console.log("newManagerID = " + newManagerID);


                let insertEEQuery;
                if(newManagerID == -1){
                    insertEEQuery = `INSERT INTO employee (first_name, last_name, role_id)
                    values ('${response.f_name}', '${response.l_name}', ${newRoleID});`;
                } else {
                    insertEEQuery= `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    values ('${response.f_name}', '${response.l_name}', ${newRoleID}, ${newManagerID});`;
                }

                connection.query(insertEEQuery, function(err, newEERes) {
                    if (err) throw err;

                    repeat();
                });                

            });
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