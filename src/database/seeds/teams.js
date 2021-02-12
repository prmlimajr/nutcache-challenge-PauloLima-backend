exports.seed = function (knex) {
  return knex('teams')
    .del()
    .then(function () {
      return knex('teams').insert([
        { id: 1, description: 'Mobile' },
        { id: 2, description: 'Frontend' },
        { id: 3, description: 'Backend' }
      ]);
    });
};