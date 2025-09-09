// src/components/Calendar.jsx
import React from 'react';
import './Calendar.css';

const statusTranslations = {
  paid: 'Pago',
  pending: 'Pendente',
  not_required: 'Não Requerido',
  avulso: 'Avulso',
  mensalista: 'Mensalista',
  reposicao: 'Reposição',
  ausencia: 'Ausência'
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 23; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

const Calendar = ({ bookings, isAdmin = false, weekStartDate, selectedDate, onSlotClick, cart = [] }) => {
  const daysOfWeekNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const timeSlots = generateTimeSlots();

  const weekDays = daysOfWeekNames.map((_, index) => {
    const referenceDate = isAdmin ? weekStartDate : selectedDate;
    const date = new Date(referenceDate);
    if (isAdmin) {
      date.setDate(referenceDate.getDate() + index);
    }
    return date;
  });

  const getBookingForSlot = (dayDate, time) => {
    const [slotHour, slotMinute] = time.split(':').map(Number);
    const slotTime = new Date(dayDate);
    slotTime.setHours(slotHour, slotMinute, 0, 0);
    for (const booking of bookings) {
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      if (slotTime >= startTime && slotTime < endTime) {
        return booking;
      }
    }
    return null;
  };

  const isSlotInCart = (time) => cart.includes(time);
  
  return (
    <div className="table-container">
      <table className="calendar-table">
        <thead>
          <tr>
            <th className="time-header">Horário</th>
            {weekDays.map((date, index) => (
              <th key={index}>
                <div>{daysOfWeekNames[date.getDay()]}</div>
                <div className="date-header">
                  {`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="time-cell">{time}</td>
              {weekDays.map((dayDate) => {
                const dayIndex = dayDate.getDay();
                const booking = getBookingForSlot(dayDate, time);
                const isBooked = booking && booking.booking_type !== 'ausencia';
                
                let slotClass = 'slot';
                if (isBooked) {
                  slotClass += ` ${booking.booking_type}`;
                } else if (booking && booking.booking_type === 'ausencia') {
                  slotClass += ' ausencia';
                } else {
                  slotClass += ' available-admin';
                }
                
                return (
                  <td 
                    key={`${dayIndex}-${time}`} 
                    className={slotClass}
                    onClick={() => onSlotClick(dayDate, time, booking)}
                  >
                    {isBooked ? (
                      <div className="admin-slot-details">
                        <span className="user-name">{booking.guest_name || booking.user_name || 'Avulso'}</span>
                        <span className="payment-status">{statusTranslations[booking.payment_status]}</span>
                        {booking.note && <span className="booking-note">{booking.note}</span>}
                      </div>
                    ) : booking && booking.booking_type === 'ausencia' ? (
                      <div className="admin-slot-details">
                          <span className="user-name">{booking.guest_name || booking.user_name}</span>
                          <span className="booking-note">(Ausente)</span>
                      </div>
                    ) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;