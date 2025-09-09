'use strict';
exports.up = (pgm) => {
  pgm.addColumn('bookings', {
    parent_booking_id: { 
      type: 'integer', 
      references: '"bookings"', 
      onDelete: 'CASCADE' // Se a regra for apagada, os filhos também são
    }
  });
};
exports.down = (pgm) => {
  pgm.dropColumn('bookings', 'parent_booking_id');
};