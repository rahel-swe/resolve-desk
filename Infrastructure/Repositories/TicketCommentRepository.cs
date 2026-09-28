using Microsoft.EntityFrameworkCore;
using ResolveDesk.Infrastructure.Data;
using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Abstractions;

public class TicketCommentRepository(AppDbContext db) : ITicketCommentRepository
{

    private readonly AppDbContext _db = db;

    public async Task AddAsync(TicketComment comment)
    {
        _db.TicketComments.Add(comment);

        await _db.SaveChangesAsync();
    }

    public async Task<List<TicketComment>> GetByTicketIdAsync(int ticketId)
    {
        return await _db.TicketComments
            .Where(comment => comment.TicketId == ticketId)
            .OrderBy(comment => comment.CreatedAt)
            .ToListAsync();
    }

    public async Task<TicketComment?> GetCommentByIdAsync(int id)
    {
        return await _db.TicketComments.FirstOrDefaultAsync(comment => comment.Id == id);
    }
}
