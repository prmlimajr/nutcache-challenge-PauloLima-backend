exports.up = function (knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.foreign('genderId').references('id').inTable('genders');
    table.foreign('teamId').references('id').inTable('teams');
  });
};

exports.down = function (knex) {};