# Manage Employee Database

## Description

This is a program that allows the user to manage employees in a company.  The employee data is stored in a mySQL database, across three tables holding information about the departments, roles, and employees, built to a desired specification.  The data in the various tables in the database is joined in mySQL to get the data as needed to display and modify the database at user request.  The user interface is a command line program.

To use the application, there is a seed.sql file included in the repository that sets up the database, 'employee_db', and the three tables inside it, and then populates the tables with some starting data.  Once the npm package has been installed, the program to run is 'manage.js'.

The functionality included at this time is:
* Add new Employee, Role or Department
* View All Employees, Roles or Deparments
* Update Employee Role
* Calculate Budget for a Department

## Technologies Used
The application is created in Node.  It uses the Node package inquirer to collect user input.  The Node package mysql is used to send queries to/receive responses from the mySQL database.

To format output, the npm package console.table was also installed and used to format data retrieved from the database.

## Resources

https://www.quackit.com/mysql/examples/mysql_self_join.cfm - This page provided information about how to join a table in mySQL to itself.

## License

[MIT](https://choosealicense.com/licenses/mit/)