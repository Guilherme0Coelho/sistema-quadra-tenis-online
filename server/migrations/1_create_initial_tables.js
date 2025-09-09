'use strict';

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id', name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(50)', notNull: true, default: 'client' },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.createTable('courts', {
    id: 'id', name: { type: 'varchar(255)', notNull: true },
    contact_info: { type: 'text' },
  });
  pgm.createTable('bookings', {
    id: 'id', user_id: { type: 'integer', references: '"users"', onDelete: 'SET NULL' },
    court_id: { type: 'integer', notNull: true, references: '"courts"', onDelete: 'CASCADE' },
    start_time: { type: 'timestamp with time zone', notNull: true },
    end_time: { type: 'timestamp with time zone', notNull: true },
    booking_type: { type: 'varchar(50)', notNull: true },
    payment_status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    payment_intent_id: { type: 'varchar(255)' },
    is_recurring: { type: 'boolean', default: false },
    guest_name: { type: 'varchar(255)' },
    price: { type: 'decimal(10, 2)', notNull: true, default: 0.00 },
    note: { type: 'text' },
  });
};
exports.down = (pgm) => {
  pgm.dropTable('bookings');
  pgm.dropTable('courts');
  pgm.dropTable('users');
};