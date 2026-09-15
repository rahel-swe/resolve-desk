using ResolveDesk.Common;
using ResolveDesk.Dtos;
using ResolveDesk.Models;
using ResolveDesk.Repositories;

namespace ResolveDesk.Services;

public class TicketCommentService(ITicketCommentRepository ticketCommentRepository, ITicketRepository ticketRepository) : ITicketCommentService
{
    private readonly ITicketRepository _ticketRepository = ticketRepository;
    private readonly ITicketCommentRepository _ticketCommentRepository = ticketCommentRepository;


    private async Task CheckTicketExistence(int ticketId)
    {
        var exists = await _ticketRepository.ExistsAsync(ticketId);

        if (!exists)
            throw new NotFoundException($"Ticket not found with this id: {ticketId}");
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
