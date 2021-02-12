
exports.up = function(knex) {
  return knex.schema.createTable('employees', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.dateTime('birthday').notNullable();
    table.integer('genderId').notNullable().unsigned();
    table.string('email').notNullable().unique();
    table.string('cpf').notNullable().unique();
    table.dateTime('start').notNullable();
    table.integer('teamId').unsigned();
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('employees');
};
