using Microsoft.EntityFrameworkCore;
using SupportPilotAI.Data;
using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

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

    public async Task UpdateAsync(Ticket ticket)
    {
        _db.Tickets.Update(ticket);

        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Ticket ticket)
    {
        _db.Tickets.Remove(ticket);
        await _db.SaveChangesAsync();
    }
}
