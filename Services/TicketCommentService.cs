using SupportPilotAI.Common;
using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Repositories;

namespace SupportPilotAI.Services;

public class TicketCommentService(ITicketCommentRepository ticketCommentRepository) : ITicketCommentService
{
    private readonly ITicketCommentRepository _ticketCommentRepository = ticketCommentRepository;
    public async Task AddTicketCommentAsync(int ticketId, CreateTicketCommentDto request)
    {
        var comment = new TicketComment
        {
            Message = request.Message,
            TicketId = ticketId,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketCommentRepository.AddAsync(comment);
    }

    public async Task<List<TicketComment>> GetTicketCommentsAsync(int ticketId)
    {
        var ticketComments = await _ticketCommentRepository.GetByTicketIdAsync(ticketId);

        return ticketComments;

    }

}
