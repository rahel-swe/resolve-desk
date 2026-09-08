using SupportPilotAI.Data;
using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public class TicketCommentRepository(AppDbContext db) : ITicketCommentRepository
{

    private readonly AppDbContext _db = db;

    public Task AddAsync(TicketComment comment)
    {
        throw new NotImplementedException();
    }

    public Task<List<TicketComment>> GetByTicketIdAsync(int ticketId)
    {
        throw new NotImplementedException();
    }
}
