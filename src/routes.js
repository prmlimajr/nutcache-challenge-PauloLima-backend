const express = require('express');
const routes = express.Router();

const EmployeeController = require('./app/controllers/EmployeeController');

routes.post('/employee', EmployeeController.create);
routes.get('/employee', EmployeeController.list);
routes.get('/employee/:id', EmployeeController.listOne);
routes.put('/employee/:id', EmployeeController.update);
routes.delete('/employee/:id', EmployeeController.destroy);


module.exports = routes;