using ResolveDesk.Dtos;
using ResolveDesk.Models;

namespace ResolveDesk.Services;

public interface ITicketCommentService
{
    Task AddTicketCommentAsync(int userId, int ticketId, CreateTicketCommentDto request);

    Task<List<TicketComment>> GetTicketCommentsAsync(int ticketId);
}
