using ResolveDesk.Api.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Domain.Entities;
using ResolveDesk.Infrastructure.Repositories;

namespace ResolveDesk.Application.Services;

public class TicketCommentService(ITicketCommentRepository ticketCommentRepository, ITicketRepository ticketRepository) : ITicketCommentService
{
    private readonly ITicketRepository _ticketRepository = ticketRepository;
    private readonly ITicketCommentRepository _ticketCommentRepository = ticketCommentRepository;


    private async Task<Ticket> CheckTicketExistence(int ticketId, CancellationToken cancellationToken)
    {

        var ticket = await _ticketRepository.GetByIdAsync(ticketId, cancellationToken);

        if (ticket is null)
            throw new NotFoundException($"Ticket not found with this id: {ticketId}");

        return ticket;
    }

    private async Task<bool> CanReadTicket(int ticketId, CurrentUser caller, CancellationToken cancellationToken)
    {
        var ticket = await CheckTicketExistence(ticketId, cancellationToken);

        if (caller.IsAdmin || caller.IsSupportAgent)
            return true;

        return caller.IsCustomer && ticket!.UserId == caller.Id;
    }

    public async Task AddTicketCommentAsync(int userId, int ticketId, CreateTicketCommentDto request, CurrentUser caller, CancellationToken cancellationToken)
    {
        var canRead = await CanReadTicket(ticketId, caller, cancellationToken);

        if (!canRead)
            throw new NotFoundException($"Ticket not found with this id: {ticketId}");

        var comment = new TicketComment
        {
            Message = request.Message,
            TicketId = ticketId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketCommentRepository.AddAsync(comment);
    }

    public async Task<List<TicketCommentResponseDto>> GetTicketCommentsAsync(int ticketId, CurrentUser caller, CancellationToken cancellationToken)
    {
        var canRead = await CanReadTicket(ticketId, caller, cancellationToken);

        if (!canRead)
            throw new ConflictException("User not allowed to read this ticket comments");

        var comments = await _ticketCommentRepository.GetByTicketIdAsync(ticketId);


        return comments.Select(comment => new TicketCommentResponseDto
        {
            Id = comment.Id,
            Message = comment.Message,
            CreatedAt = comment.CreatedAt,
            TicketId = comment.TicketId,
            UserId = comment.UserId
        }).ToList();

    }

    public async Task<TicketCommentResponseDto?> GetCommentByIdAsync(int ticketId, int commentId, CurrentUser caller, CancellationToken cancellationToken)
    {
        var canRead = await CanReadTicket(ticketId, caller, cancellationToken);

        if (!canRead)
            throw new ConflictException("User not allowed to read this ticket comments");

        var comment = await _ticketCommentRepository.GetCommentByIdAsync(commentId);

        if (comment is null || comment.TicketId != ticketId)
            throw new NotFoundException($"Comment not found with this id: {commentId}");

        return new TicketCommentResponseDto
        {
            Id = comment.Id,
            Message = comment.Message,
            CreatedAt = comment.CreatedAt,
            TicketId = comment.TicketId,
            UserId = comment.UserId
        };
    }


}
