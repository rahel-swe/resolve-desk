using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public interface ITicketCommentRepository
{
    Task<List<TicketComment>> GetByTicketIdAsync(int ticketId);
    Task AddAsync(TicketComment comment);
}
