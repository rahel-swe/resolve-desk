using ResolveDesk.Entities;

namespace ResolveDesk.Repositories;

public interface ITicketCommentRepository
{
    Task<List<TicketComment>> GetByTicketIdAsync(int ticketId);
    Task AddAsync(TicketComment comment);

    Task<TicketComment?> GetCommentByIdAsync(int id);
}
