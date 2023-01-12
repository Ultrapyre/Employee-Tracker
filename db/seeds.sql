INSERT INTO department (name)
VALUES ("Sales"),
       ("Filing"),
       ("Advertising"),
       ("IT"),
       ("Coffee");

INSERT INTO role (title, salary, department_id)
VALUES  ("Salesman", 500000, 1),
        ("Spokesman", 300000, 3),
        ("Programmer", 200000, 4),
        ("IT Manager", 600000, 4),
        ("Coffee Gopher", 20, 5),
        ("Creative Designer", 300000, 3),
        ("The folders guy", 200, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Marcus", "Johnson", 4, NULL),
        ("Samuel", "Jackson", 3, 1),
        ("James", "Sunderland", 7, NULL)