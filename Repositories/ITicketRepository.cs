using ResolveDesk.Dtos;
using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public interface ITicketRepository
{
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<bool> ExistsAsync(int id);
    Task<Ticket?> GetByIdAsync(int id);
    Task<List<Ticket>> GetAllAsync();
    Task<List<Ticket>> GetByUserIdAsync(int userId);
    Task DeleteAsync(Ticket ticket);

    Task UpdateStatusWithHistoryAsync(Ticket ticket, TicketHistory history);

    Task<List<TicketHistory>> GetHistoryByTicketIdAsync(int ticketId);
}
