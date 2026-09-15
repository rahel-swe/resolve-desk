using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public interface ITicketRepository
{
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<bool> ExistsAsync(int id);
    Task<Ticket?> GetByIdAsync(int id);
    Task<List<Ticket>> GetAllAsync();
    Task<List<Ticket>> GetByUserIdAsync(int userId);
    Task UpdateAsync(Ticket ticket);
    Task DeleteAsync(Ticket ticket);
}
