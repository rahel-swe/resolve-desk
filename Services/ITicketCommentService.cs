using SupportPilotAI.Dtos;
using SupportPilotAI.Models;

namespace SupportPilotAI.Services;

public interface ITicketCommentService
{
    Task AddTicketCommentAsync(int ticketId, CreateTicketCommentDto request);

    Task<List<TicketComment>> GetTicketCommentsAsync(int ticketId);
}
