using Microsoft.EntityFrameworkCore;
using ResolveDesk.Data;
using ResolveDesk.Dtos;
using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public class TicketRepository(AppDbContext db) : ITicketRepository
{
    private readonly AppDbContext _db = db;

    public async Task<Ticket> CreateAsync(Ticket ticket)
    {
        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        return ticket;
    }

    public async Task<List<Ticket>> GetAllAsync()
    {
        return await _db.Tickets
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .OrderByDescending(t => t.CreatedAt)
        .ToListAsync();
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _db.Tickets
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .FirstOrDefaultAsync(t => t.Id == id);
    }

    public Task<List<Ticket>> GetByUserIdAsync(int userId)
    {
        return _db.Tickets
        .Where(t => t.UserId == userId)
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .OrderByDescending(t => t.CreatedAt)
        .ToListAsync();
    }

    public async Task DeleteAsync(Ticket ticket)
    {
        _db.Tickets.Remove(ticket);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _db.Tickets.AnyAsync(t => t.Id == id);
    }

    public async Task UpdateStatusWithHistoryAsync(Ticket ticket, TicketHistory history)
    {
        _db.Tickets.Update(ticket);
        _db.TicketHistories.Add(history);

        await _db.SaveChangesAsync();
    }

    public async Task<List<TicketHistory>> GetHistoryByTicketIdAsync(int ticketId)
    {
        return await _db.TicketHistories
        .Where(history => history.TicketId == ticketId)
        .Include(history => history.ActorUser)
        .OrderBy(history => history.CreatedAt)
        .ToListAsync();
    }
}
