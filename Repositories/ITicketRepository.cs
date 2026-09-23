using ResolveDesk.Dtos;
using ResolveDesk.Enums;
using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public interface ITicketRepository
{
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<bool> ExistsAsync(int id);
    Task<(List<Ticket> Items, int TotalCount)> GetAllAsync(TicketListQueryDto query, CancellationToken cancellationToken);
    Task<(List<Ticket> Items, int TotalCount)> GetByUserIdAsync(TicketListQueryDto query, int userId, CancellationToken cancellationToken);
    Task DeleteAsync(Ticket ticket);

    Task UpdateStatusWithHistoryAsync(Ticket ticket, TicketHistory history);

    Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<List<TicketHistory>> GetHistoryByTicketIdAsync(int ticketId, CancellationToken cancellationToken);
}
