using SupportPilotAI.Common;
using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Repositories;

namespace SupportPilotAI.Services;

public class TicketCommentService(ITicketCommentRepository ticketCommentRepository, ITicketRepository ticketRepository) : ITicketCommentService
{
    private readonly ITicketRepository _ticketRepository = ticketRepository;
    private readonly ITicketCommentRepository _ticketCommentRepository = ticketCommentRepository;


    private async Task CheckTicketExistence(int ticketId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket is null) throw new NotFoundException($"Ticket not found with this id: {ticketId}");
    }

    public async Task AddTicketCommentAsync(int userId, int ticketId, CreateTicketCommentDto request)
    {
        await CheckTicketExistence(ticketId);

        var comment = new TicketComment
        {
            Message = request.Message,
            TicketId = ticketId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketCommentRepository.AddAsync(comment);
    }

    public async Task<List<TicketComment>> GetTicketCommentsAsync(int ticketId)
    {
        await CheckTicketExistence(ticketId);

        var ticketComments = await _ticketCommentRepository.GetByTicketIdAsync(ticketId);

        return ticketComments;

    }

}
