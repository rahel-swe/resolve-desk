using ResolveDesk.Application.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Application.Abstractions;
using ResolveDesk.Domain.Enums;
using ResolveDesk.Api.Common;

namespace ResolveDesk.Application.Tickets;

public class AssignTicketHandler(ITicketRepository ticketRepository, IUserRepository userRepository, TicketRules ticketRules)
{
    private readonly ITicketRepository _ticketRepository = ticketRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly TicketRules _ticketRules = ticketRules;

    public async Task<ServiceResult<TicketResponseDto?>> AssignTicketAsync(int id, AssignTicketDto request, CurrentUser caller, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id, cancellationToken);

        if (ticket is null || !_ticketRules.CanReadTicket(ticket, caller))
            throw new NotFoundException($"Ticket not found with id: {id}");

        if (!_ticketRules.CanAssignTicket(ticket, caller, request.AssignedStaffId))
            throw new ConflictException("User is not allowed to assign this ticket.");

        var assignee = await _userRepository.GetByIdAsync(request.AssignedStaffId, cancellationToken);

        var adminAssigningSelf = caller.IsAdmin &&
            assignee is { Role: UserRole.Admin } &&
            assignee.Id == caller.Id;

        if (assignee is null || (assignee.Role != UserRole.Staff && !adminAssigningSelf))
            throw new ConflictException("Assigned user must be a staff member or the assigning administrator.");

        ticket.AssignedStaffId = request.AssignedStaffId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.SaveChangesAsync(cancellationToken);

        var ticketResponseDto = new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            CreatedByEmail = ticket.User?.Email ?? string.Empty,
            CreatedByFullName = ticket.User?.FullName ?? string.Empty,
            AssignedStaffEmail = assignee.Email,
            AssignedStaffFullName = assignee.FullName
        };

        return new ServiceResult<TicketResponseDto?>(ticketResponseDto);

    }
}
