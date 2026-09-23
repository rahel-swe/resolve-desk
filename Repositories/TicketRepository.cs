using Microsoft.EntityFrameworkCore;
using ResolveDesk.Data;
using ResolveDesk.Dtos;
using ResolveDesk.Enums;
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

    public async Task<(List<Ticket> Items, int TotalCount)> GetAllAsync(TicketListQueryDto query, CancellationToken cancellationToken)
    {
        var ticketsQuery = _db.Tickets.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            ticketsQuery = ticketsQuery.Where(ticket =>
                ticket.Title.Contains(search) ||
                ticket.Description.Contains(search) ||
                ticket.Category.Contains(search));
        }

        if (query.Status is not null)
            ticketsQuery = ticketsQuery.Where(t => t.Status == query.Status);

        var totalCount = await ticketsQuery.CountAsync(cancellationToken);



        var items = await ticketsQuery
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .OrderByDescending(t => t.CreatedAt)
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _db.Tickets
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<(List<Ticket> Items, int TotalCount)> GetByUserIdAsync(TicketListQueryDto query, int userId, CancellationToken cancellationToken)
    {
        var ticketsQuery = _db.Tickets.AsNoTracking().Where(t => t.UserId == userId).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.
        Search))
            ticketsQuery = ticketsQuery.Where(ticket => ticket.Title.Contains(query.Search));

        if (query.Status is not null)
            ticketsQuery = ticketsQuery.Where(t => t.Status == query.Status);


        var totalCount = await ticketsQuery.CountAsync(cancellationToken);


        var items = await ticketsQuery
        .Include(t => t.User)
        .Include(t => t.AssignedAgent)
        .OrderByDescending(t => t.CreatedAt)
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .ToListAsync(cancellationToken);

        return (items, totalCount);
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
        _db.TicketHistories.Add(history);

        await _db.SaveChangesAsync();
    }

    public async Task<List<TicketHistory>> GetHistoryByTicketIdAsync(int ticketId, CancellationToken cancellationToken)
    {
        return await _db.TicketHistories
        .Where(history => history.TicketId == ticketId)
        .Include(history => history.ActorUser)
        .OrderBy(history => history.CreatedAt)
        .ToListAsync(cancellationToken);
    }
}
