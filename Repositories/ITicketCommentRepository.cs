using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public interface ITicketCommentRepository
{
    Task<List<TicketComment>> GetByTicketIdAsync(int ticketId);
    Task AddAsync(TicketComment comment);
}
