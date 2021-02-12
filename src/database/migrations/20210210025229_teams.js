exports.up = function (knex) {
  return knex.schema.createTable('teams', (table) => {
    table.increments('id').primary();
    table.string('description').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('teams');
};