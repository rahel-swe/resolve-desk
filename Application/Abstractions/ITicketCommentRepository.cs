using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Infrastructure.Repositories;

public interface ITicketCommentRepository
{
    Task<List<TicketComment>> GetByTicketIdAsync(int ticketId);
    Task AddAsync(TicketComment comment);

    Task<TicketComment?> GetCommentByIdAsync(int id);
}
