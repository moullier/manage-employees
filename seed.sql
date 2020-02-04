DROP DATABASE IF EXISTS employee_db;

CREATE database employee_db;

use employee_db;

CREATE TABLE department (
    id int(10) primary key auto_increment not null,
    name varchar(30) not null
);

CREATE TABLE roles (
    id int(10) primary key auto_increment not null,
    title varchar(30) not null,
    salary dec(10,2) not null,
    department_id int(10) not null,
    foreign key (department_id) references department(id)
);

CREATE TABLE employee (
    id int(10) primary key auto_increment not null,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
	role_id int(10) not null,
    foreign key (role_id) references roles(id),
    manager_id int(10),
    foreign key (manager_id) references employee(id)
);



INSERT INTO department (name) values ("Legal");
INSERT INTO department (name) values ("Finance");
INSERT INTO department (name) values ("Engineering");
INSERT INTO department (name) values ("Sales");


INSERT INTO roles (title, salary, department_id) values ("Legal Team Lead", 250000.00, 1);
INSERT INTO roles (title, salary, department_id) values ("Lawyer", 160000.00, 1);
INSERT INTO roles (title, salary, department_id) values ("Paralegal", 45000.00, 1);
INSERT INTO roles (title, salary, department_id) values ("Accountant", 125000.00, 1);
INSERT INTO roles (title, salary, department_id) values ("Lead Engineer", 150000.00, 3);
INSERT INTO roles (title, salary, department_id) values ("Software Engineer", 120000.00, 3);
INSERT INTO roles (title, salary, department_id) values ("Sales Lead", 100000.00, 4);
INSERT INTO roles (title, salary, department_id) values ("Salesperson", 80000.00, 4);

INSERT INTO employee (first_name, last_name, role_id) values ("Susan", "O'Malley", 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) values ("Josiah", "Buckworth", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) values ("Sandy", "Collings", 2, 1);
INSERT INTO employee (first_name, last_name, role_id) values ("Royce", "McGill", 5);
INSERT INTO employee (first_name, last_name, role_id, manager_id) values ("George", "Pawlenty", 6, 4);