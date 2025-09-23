// src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { createBooking, updateBooking, deleteBooking } = require('../queries/bookingQueries');
const pool = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/authMiddleware');

// Função que gera os agendamentos REAIS de uma regra de mensalista
const generateRecurringBookings = async (rule, weeksToGenerate = 12) => {
    let newBookingsCount = 0;
    for (let i = 0; i < weeksToGenerate * 7; i++) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const targetDate = new Date(today);
        targetDate.setUTCDate(targetDate.getUTCDate() + i);
        const originalStartTime = new Date(rule.start_time);
        if (targetDate.getUTCDay() === originalStartTime.getUTCDay()) {
            const newStartTime = new Date(targetDate);
            newStartTime.setUTCHours(originalStartTime.getUTCHours(), originalStartTime.getUTCMinutes(), 0, 0);
            if (newStartTime < new Date()) continue;
            const duration = new Date(rule.end_time) - originalStartTime;
            const newEndTime = new Date(newStartTime.getTime() + duration);
            const existingQuery = await pool.query(`SELECT id FROM bookings WHERE start_time = $1 AND is_recurring = false`, [newStartTime]);
            if (existingQuery.rows.length === 0) {
                await createBooking({
                    userId: rule.user_id, courtId: rule.court_id, startTime: newStartTime.toISOString(),
                    endTime: newEndTime.toISOString(), bookingType: 'mensalista',
                    paymentStatus: 'pending', isRecurring: false,
                    guestName: rule.guest_name, price: rule.price, note: 'Gerado automaticamente',
                    parentBookingId: rule.id
                });
                newBookingsCount++;
            }
        }
    }
    return newBookingsCount;
};

// Rota pública do cliente
router.get('/public', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'A data é obrigatória.' });
        const selectedDate = new Date(`${date}T00:00:00.000Z`);
        const nextDay = new Date(selectedDate);
        nextDay.setUTCDate(selectedDate.getUTCDate() + 1);
        const result = await pool.query(
            `SELECT id, start_time, end_time, booking_type FROM bookings 
             WHERE is_recurring = false AND booking_type != 'ausencia' 
             AND start_time >= $1 AND start_time < $2 ORDER BY start_time`, 
            [selectedDate, nextDay]
        );
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// Rota da agenda do admin
router.get('/admin', authMiddleware, async (req, res) => {
    const { startDate: startDateString } = req.query;
    if (!startDateString) return res.status(400).json({ error: 'A data de início da semana é obrigatória.' });
    try {
        const weekStart = new Date(`${startDateString}T00:00:00.000Z`);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 7);
        const query = `SELECT b.*, u.name as user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE b.start_time >= $1 AND b.start_time < $2 AND b.is_recurring = false AND b.booking_type != 'ausencia' ORDER BY b.start_time`;
        const { rows } = await pool.query(query, [weekStart, weekEnd]);
        
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// Rota para gerar agendamentos recorrentes
router.post('/admin/generate-recurring', authMiddleware, async (req, res) => {
    try {
        const { weeksToGenerate } = req.body;
        const recurringRulesQuery = await pool.query(`SELECT * FROM bookings WHERE is_recurring = true AND booking_type = 'mensalista'`);
        const rules = recurringRulesQuery.rows;
        let totalNewBookings = 0;
        for (const rule of rules) {
            totalNewBookings += await generateRecurringBookings(rule, weeksToGenerate);
        }
        res.status(200).json({ message: `${totalNewBookings} novos agendamentos de mensalistas foram gerados.` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar agendamentos.' });
    }
});

// Rota para listar as REGRAS de mensalistas
router.get('/admin/recurring-rules', authMiddleware, async (req, res) => {
    try {
        const query = `SELECT b.*, u.name as user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE b.is_recurring = true AND b.booking_type = 'mensalista' ORDER BY b.start_time`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota POST para o admin (cria avulso, reposição ou a REGRA mensalista)
router.post('/admin', authMiddleware, async (req, res) => {
  try {
    const newBooking = await createBooking(req.body);
    if (newBooking.is_recurring && newBooking.booking_type === 'mensalista') {
        await generateRecurringBookings(newBooking);
    }
    res.status(201).json(newBooking);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar agendamento.' }); }
});

// Rota para ATUALIZAR um agendamento
router.put('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const updatedBooking = await updateBooking(req.params.id, req.body);
    if (!updatedBooking) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.json(updatedBooking);
  } catch (error) { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// Rota para EXCLUIR um agendamento (real ou regra)
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const deletedBooking = await deleteBooking(req.params.id);
    if (!deletedBooking) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.status(200).json({ message: 'Agendamento excluído com sucesso.' });
  } catch (error) { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// Rota Financeira (COM A CORREÇÃO DE CACHE)
router.get('/finance', authMiddleware, async (req, res) => {
  if (req.user.admin_level !== 'super') {
    return res.status(403).json({ error: 'Acesso proibido. Apenas para Super Admins.' });
  }

  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
  try {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, parseInt(month) + 1, 1));
    const { rows } = await pool.query(`SELECT b.*, u.name as user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE b.is_recurring = false AND b.start_time >= $1 AND b.start_time < $2 ORDER BY b.start_time DESC`, [startDate, endDate]);
    
    // CORREÇÃO: Adiciona o cabeçalho para não guardar em cache
    res.setHeader('Cache-Control', 'no-cache');
    
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { duration, bookingDetails } = req.body;

    if (!duration || !bookingDetails || !bookingDetails.slot || !bookingDetails.slot.date || !bookingDetails.slot.time) {
      return res.status(400).json({ error: 'Dados do agendamento estão incompletos.' });
    }
    
    const pricePer30Min = 5000;
    const amountInCents = (duration / 30) * pricePer30Min;
    
    const dateObj = new Date(bookingDetails.slot.date);
    const dateStr = `${String(dateObj.getUTCDate()).padStart(2, '0')}/${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}/${dateObj.getUTCFullYear()}`;
    const description = `Data: ${dateStr} às ${bookingDetails.slot.time}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // A LINHA COM ERRO FOI REMOVIDA. O Stripe pedirá o e-mail por padrão.
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Reserva de Quadra - ${duration} min`,
            description: description,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://sistema-quadra-tenis-online.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://sistema-quadra-tenis-online.vercel.app/`,
    });
    
    res.json({ url: session.url });

  } catch (error) { 
      console.error("ERRO AO CRIAR SESSÃO NO STRIPE:", error);
      res.status(500).json({ error: 'Falha ao criar sessão de pagamento.' }); 
  }
});
router.post('/verify-session-and-save', async (req, res) => {
  try {
    const { session_id, bookingDetails } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const paymentIntentId = session.payment_intent;
      const existingBookingQuery = await pool.query(`SELECT id FROM bookings WHERE payment_intent_id = $1`, [paymentIntentId]);
      if (existingBookingQuery.rows.length > 0) {
        return res.status(200).json({ success: true, message: 'Agendamento já registrado.' });
      }
      const [hour, minute] = bookingDetails.slot.time.split(':');
      const startTime = new Date(bookingDetails.slot.date);
      startTime.setHours(hour, minute, 0, 0);
      const endTime = new Date(startTime.getTime() + bookingDetails.duration * 60000);
      await createBooking({
        userId: null, courtId: 1, startTime: startTime.toISOString(), endTime: endTime.toISOString(), bookingType: 'avulso',
        paymentStatus: 'paid', isRecurring: false, paymentIntentId: paymentIntentId,
        price: session.amount_total / 100,
      });
      res.status(201).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Pagamento não confirmado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Falha ao verificar a sessão.' });
  }
});
// NOVA ROTA PARA ATUALIZAÇÃO EM MASSA (PAGAR O MÊS)
router.post('/admin/bulk-status-update', authMiddleware, async (req, res) => {
    const { parent_booking_id, year, month, payment_status, price } = req.body;
    if (!parent_booking_id || !year || !month || !payment_status) {
        return res.status(400).json({ error: 'Dados insuficientes para atualização.' });
    }
    try {
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, parseInt(month) + 1, 1));

        await pool.query(
            `UPDATE bookings SET payment_status = $1, price = $2 
             WHERE parent_booking_id = $3 AND start_time >= $4 AND start_time < $5`,
            [payment_status, price, parent_booking_id, startDate, endDate]
        );
        res.status(200).json({ message: 'Status do mês atualizado com sucesso.' });
    } catch (error) {
        console.error("Erro na atualização em massa:", error);
        res.status(500).json({ error: 'Erro ao atualizar status.' });
    }
});
module.exports = router;