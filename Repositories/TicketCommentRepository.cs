using Microsoft.EntityFrameworkCore;
using SupportPilotAI.Data;
using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

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
}
