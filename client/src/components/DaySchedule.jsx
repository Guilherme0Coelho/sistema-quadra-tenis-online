// src/components/DaySchedule.jsx
import React from 'react';
import './DaySchedule.css';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 23; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

const DaySchedule = ({ bookings, onSlotClick, cart }) => {
  const timeSlots = generateTimeSlots();

  const getBookingForSlot = (time) => {
    const [slotHour, slotMinute] = time.split(':').map(Number);
    for (const booking of bookings) {
      // Usa getHours/getMinutes para comparar na hora local do navegador
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();

      if (
        (slotHour > startHour || (slotHour === startHour && slotMinute >= startMinute)) &&
        (slotHour < endHour || (slotHour === endHour && slotMinute < endMinute))
      ) {
        return booking;
      }
    }
    return null;
  };

  return (
    <div className="schedule-container">
      {timeSlots.map(time => {
        const booking = getBookingForSlot(time);
        const isBooked = booking && booking.booking_type !== 'ausencia';
        const isInCart = cart.includes(time);
        const isAvailable = !isBooked;

        let statusClass = '';
        let statusText = 'Disponível';

        if (isBooked) {
          statusClass = booking.booking_type;
          statusText = booking.booking_type === 'mensalista' ? 'Horário Fixo' : 'Ocupado';
        } else if (isInCart) {
          statusClass = 'selected';
          statusText = 'Selecionado';
        }

        return (
          <div
            key={time}
            className={`slot-row ${isAvailable ? 'available' : 'booked'} ${statusClass}`}
            onClick={() => isAvailable && onSlotClick(time)}
          >
            <span className="slot-time">{time}</span>
            <span className={`slot-status ${statusClass}`}>{statusText}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DaySchedule;