// src/queries/bookingQueries.js
const pool = require('../db');
const createBooking = async (bookingDetails) => {
  const { userId, courtId, startTime, endTime, bookingType, paymentStatus, isRecurring, guestName, price, note, parentBookingId } = bookingDetails;
  const query = `
    INSERT INTO bookings (user_id, court_id, start_time, end_time, booking_type, payment_status, is_recurring, guest_name, price, note, parent_booking_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
  const values = [userId, courtId, startTime, endTime, bookingType, paymentStatus, isRecurring, guestName, price || 0, note, parentBookingId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
const updateBooking = async (id, bookingDetails) => {
  const fields = [], values = []; let argCount = 1;
  for (const key in bookingDetails) {
    if (bookingDetails[key] !== undefined) {
      const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${snakeCaseKey} = $${argCount++}`);
      values.push(bookingDetails[key]);
    }
  }
  if (fields.length === 0) { const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]); return rows[0]; }
  let query = `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${argCount} RETURNING *;`;
  values.push(id);
  const { rows } = await pool.query(query, values);
  return rows[0];
};
const deleteBooking = async (id) => {
  const { rows } = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *;', [id]);
  return rows[0];
};
module.exports = { createBooking, updateBooking, deleteBooking };