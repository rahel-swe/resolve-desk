using ResolveDesk.Application.Dtos;
using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Abstractions;

public interface ITicketRepository
{
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<bool> ExistsAsync(int id);
    Task<(List<TicketResponseDto> Items, int TotalCount)> GetAllAsync(TicketListQueryDto query, CancellationToken cancellationToken);
    Task<(List<TicketResponseDto> Items, int TotalCount)> GetByUserIdAsync(TicketListQueryDto query, int userId, CancellationToken cancellationToken);
    Task DeleteAsync(Ticket ticket);

    Task UpdateStatusWithHistoryAsync(Ticket ticket, TicketHistory history);

    Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<List<TicketHistoryResponseDto>> GetHistoryByTicketIdAsync(int ticketId, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
