'use strict';

exports.up = (pgm) => {
  // Adiciona a nova coluna, que pode ser 'super' ou 'staff'
  pgm.addColumn('users', {
    admin_level: { type: 'varchar(50)' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'admin_level');
};