using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public interface ITicketRepository
{
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<Ticket?> GetByIdAsync(int id);
    Task<List<Ticket>> GetAllAsync();
    Task<List<Ticket>> GetByUserIdAsync(int userId);
    Task UpdateAsync(Ticket ticket);
    Task DeleteAsync(Ticket ticket);
}