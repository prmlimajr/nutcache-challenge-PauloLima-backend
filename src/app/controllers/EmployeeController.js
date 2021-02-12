const knex = require('../../database/connection');
const Yup = require('yup');
const dateFns = require('date-fns');
const cpfValidator = require('cpf-cnpj-validator').cpf;

class EmployeeController {
  async create (req, res) {

    const { name, birthday, genderId, email, cpf, start, teamId } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      birthday: Yup.date().required(),
      genderId: Yup.number().positive().required(),
      email: Yup.string().email().required(),
      cpf: Yup.string().required(),
      start: Yup.date().required(),
      teamId: Yup.number()
    });

    if(!await schema.isValid(req.body)) {
      return res.status(400).json({ error: 'validation failed'});
    }

    const validatedCpf = cpfValidator.isValid(cpf);

    if (!validatedCpf) {
      return res.status(403).json({ error: 'Invalid CPF' });
    }

    const [cpfExists] = await knex('employees').select('employees.*').where({ 'employees.cpf': cpf });

    if (cpfExists) {
      return res.status(403).json({ error: 'cpf already in use' });
    }

    const [emailExists] = await knex('employees').select('employees.*').where({ 'employees.email': email });

    if (emailExists) {
      return res.status(403).json({ error: 'email already in use' });
    }

    const oldEnough = dateFns.differenceInYears(dateFns.parseISO(start), dateFns.parseISO(birthday));

    if (oldEnough < 14) {
      return res.status(403).json({ error: 'Too young to work' });
    } 

    const [gender] = await knex('genders').select('genders.*').where({ 'genders.id': genderId });

    if(!gender) {
      return res.status(403).json({ error: 'Gender not selected' });
    }

    const [team] = await knex('teams').select('teams.*').where({ 'teams.id': teamId });

    if(!team) {
      return res.status(403).json({ error: 'Team not selected' });
    }

    const employee = {
      name,
      birthday,
      genderId,
      email,
      cpf,
      start,
      teamId,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const [id] = await knex('employees').insert(employee, 'id');

    return res.json({
      id,
      ...employee,
    });
  }

  async list (req, res) {
    const { search, teamId } = req.query;
    
    let call = knex('employees')
      .select(
        'employees.*',
        'genders.description as gender',
        'teams.description as team'
      )
      .join('genders', 'employees.genderId', 'genders.id')
      .leftJoin('teams', 'teams.id', 'employees.teamId');

    if (search) {
      call.andWhere((builder) => {
        builder.where('employees.name', 'like', `%${search}%`);
      });
    }

    if (teamId) {
      call.andWhere((builder) => {
        builder.where('employees.teamId', '=', teamId);
      });
    }

    const employeesList = await call;

    const employees = employeesList.map((row) => {
      return {
        id: row.id,
        name: row.name,
        birthday: dateFns.format(row.birthday, 'dd/MM/yyyy'),
        genderId: row.genderId,
        gender: row.gender,
        email: row.email,
        cpf: cpfValidator.format(row.cpf),
        start: dateFns.format(row.start, 'dd/MM/yyyy'),
        teamId: row.teamId,
        team: row.team,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return res.json(employees);
  }

  async listOne(req, res) {
    const { id } = req.params;

    const [employeeExists] = await knex('employees')
    .select(
      'employees.*',
      'genders.description as gender',
      'teams.description as team'
    )
    .join('genders', 'employees.genderId', 'genders.id')
    .leftJoin('teams', 'teams.id', 'employees.teamId')
    .where({ 'employees.id': id });

    if (!employeeExists) { 
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = {
      id: employeeExists.id,
      name: employeeExists.name,
      birthday: dateFns.format(employeeExists.birthday, 'dd/MM/yyyy'),
      genderId: employeeExists.genderId,
      gender: employeeExists.gender,
      email: employeeExists.email,
      cpf: cpfValidator.format(employeeExists.cpf),
      start: dateFns.format(employeeExists.start, 'dd/MM/yyyy'),
      teamId: employeeExists.teamId,
      team: employeeExists.team,
      created_at: employeeExists.created_at,
      updated_at: employeeExists.updated_at,
    }

    return res.json(employee);
  }

  async update (req, res) {
    const { id } = req.params;

    const [employeeExists] = await knex('employees')
    .select(
      'employees.*',
      'genders.description as gender',
      'teams.description as team'
    )
    .join('genders', 'employees.genderId', 'genders.id')
    .leftJoin('teams', 'teams.id', 'employees.teamId')
    .where({ 'employees.id': id });

    if (!employeeExists) { 
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { name, birthday, genderId, email, cpf, start, teamId } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string(),
      birthday: Yup.date(),
      genderId: Yup.number().positive(),
      email: Yup.string().email(),
      cpf: Yup.string(),
      start: Yup.date(),
      teamId: Yup.number()
    });

    if(!await schema.isValid(req.body)) {
      return res.status(400).json({ error: 'validation failed'});
    }

    if (cpf) {
      const validatedCpf = cpfValidator.isValid(cpf);
  
      if (!validatedCpf) {
        return res.status(403).json({ error: 'Invalid CPF' });
      }
  
      const [cpfExists] = await knex('employees').select('employees.*').where({ 'employees.cpf': cpf });
  
      if (cpfExists) {
        return res.status(403).json({ error: 'cpf already in use' });
      }
    }

    if (email) {
      const [emailExists] = await knex('employees').select('employees.*').where({ 'employees.email': email });
  
      if (emailExists) {
        return res.status(403).json({ error: 'email already in use' });
      }
    }

    if (start) {
      const oldEnough = dateFns.differenceInYears(dateFns.parseISO(start), dateFns.parseISO(birthday));
  
      if (oldEnough < 14) {
        return res.status(403).json({ error: 'Too young to work' });
      } 
    }

    if (genderId) {
      const [gender] = await knex('genders').select('genders.*').where({ 'genders.id': genderId });
  
      if(!gender) {
        return res.status(403).json({ error: 'Gender not selected' });
      }
    }

    if (teamId) {
      const [team] = await knex('teams').select('teams.*').where({ 'teams.id': teamId });
  
      if(!team) {
        return res.status(403).json({ error: 'Team not selected' });
      }
    }

    const employee = {
      name: name || employeeExists.name,
      birthday: birthday || employeeExists.birthday,
      genderId: genderId || employeeExists.genderId,
      email: email || employeeExists.email,
      cpf: cpf || employeeExists.cpf,
      start: start || employeeExists.start,
      teamId: teamId || employeeExists.teamId,
      updated_at: new Date(),
    }

    await knex('employees').update(employee).where({ 'employee.id': id });

    return res.json({
      id,
      ...employee
    });
  }

  async destroy ( req, res) {
    const { id } = req.params;

    const [employeeExists] = await knex('employees')
    .select(
      'employees.*',
      'genders.description as gender',
      'teams.description as team'
    )
    .join('genders', 'employees.genderId', 'genders.id')
    .leftJoin('teams', 'teams.id', 'employees.teamId')
    .where({ 'employees.id': id });

    if (!employeeExists) { 
      return res.status(404).json({ error: 'Employee not found' });
    }

    await knex('employees').del().where({ 'employees.id': id });
   
    return res.json({ deleted: id });
  }
}

module.exports = new EmployeeController();