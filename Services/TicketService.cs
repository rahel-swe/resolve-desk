using ResolveDesk.Dtos;
using ResolveDesk.Models;
using ResolveDesk.Repositories;
using ResolveDesk.Enums;
using ResolveDesk.Common;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ResolveDesk.Services;

public class TicketService(ITicketRepository ticketRepository) : ITicketService
{

    private readonly ITicketRepository _ticketRepository = ticketRepository;

    private static bool CanReadTicket(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin || caller.IsSupportAgent)
            return true;

        return caller.IsCustomer && ticket.UserId == caller.Id;
    }

    private static bool CanUpdateStatus(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin)
            return true;

        return caller.IsSupportAgent &&
               ticket.AssignedAgentId == caller.Id;
    }

    private static bool IsValidStatusTransition(TicketStatus current, TicketStatus next)
    {
        return current switch
        {
            TicketStatus.Open => next == TicketStatus.InProgress,
            TicketStatus.InProgress => next == TicketStatus.WaitingForCustomer || next == TicketStatus.Resolved,
            TicketStatus.WaitingForCustomer => next == TicketStatus.InProgress,
            TicketStatus.Resolved => next == TicketStatus.Closed || next == TicketStatus.InProgress,
            TicketStatus.Closed => false,
            _ => false
        };
    }

    public async Task<ServiceResult<TicketResponseDto>> CreateTicketAsync(CreateTicketDto request, int userId)
    {
        var ticket = new Ticket
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Priority = request.Priority,
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId,
        };

        var createdTicket = await _ticketRepository.CreateAsync(ticket);

        var ticketResponseDto = new TicketResponseDto
        {
            Title = createdTicket.Title,
            Description = createdTicket.Description,
            Category = createdTicket.Category,
            Priority = createdTicket.Priority,
            Status = createdTicket.Status,
            CreatedAt = createdTicket.CreatedAt,
            CreatedByEmail = string.Empty,
            Id = createdTicket.Id
        };

        return new ServiceResult<TicketResponseDto>(ticketResponseDto);
    }

    public async Task<ServiceResult<PageResultDto<TicketResponseDto>>> GetAllTicketsAsync(TicketListQueryDto query, CurrentUser caller, CancellationToken cancellationToken)
    {
        query.Page = Math.Max(query.Page, 1);
        query.PageSize = Math.Clamp(query.PageSize, 1, 50);

        var (Items, totalCount) = caller.IsAdmin || caller.IsSupportAgent
        ? await _ticketRepository.GetAllAsync(query, cancellationToken)
        : await _ticketRepository.GetByUserIdAsync(query, caller.Id, cancellationToken);




        var ticketResponse = Items.Select(ticket => new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            CreatedByEmail = ticket.User?.Email ?? string.Empty,
            AssignedAgentEmail = ticket.AssignedAgent?.Email
        }).ToList();

        var pageResultDto = new PageResultDto<TicketResponseDto>
        {
            Items = ticketResponse,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };

        return new ServiceResult<PageResultDto<TicketResponseDto>>(pageResultDto);
    }

    public async Task<ServiceResult<TicketResponseDto?>> GetTicketByIdAsync(int id, CurrentUser caller, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id, cancellationToken);

        if (ticket is null || !CanReadTicket(ticket, caller))
            throw new NotFoundException($"Ticket not found with this id: {id}"); ;

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
            AssignedAgentEmail = ticket.AssignedAgent?.Email
        };

        return new ServiceResult<TicketResponseDto?>(ticketResponseDto);

    }

    public async Task<ServiceResult<PageResultDto<TicketResponseDto>>> GetUserTicketsAsync(TicketListQueryDto query, int userId, CurrentUser caller, CancellationToken cancellationToken)
    {
        query.Page = Math.Max(query.Page, 1);
        query.PageSize = Math.Clamp(query.PageSize, 1, 50);


        var (Items, totalCount) = await _ticketRepository.GetByUserIdAsync(query, userId, cancellationToken);

        if (!caller.IsAdmin && caller.Id != userId)
            throw new NotFoundException($"User with this id: {userId} dose not have any ticket!"); ;



        var ticketResponseDto = Items.Select(ticket => new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            CreatedByEmail = ticket.User?.Email ?? string.Empty,
            AssignedAgentEmail = ticket.AssignedAgent?.Email
        }).ToList();


        var pageResultDto = new PageResultDto<TicketResponseDto>
        {
            Items = ticketResponseDto,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)

        };
        return new ServiceResult<PageResultDto<TicketResponseDto>>(pageResultDto);
    }

    public async Task<ServiceResult<TicketResponseDto?>> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request, CurrentUser caller, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id, cancellationToken);

        if (ticket is null || !CanUpdateStatus(ticket, caller))
            throw new NotFoundException($"Ticket not found with this id: {id}");

        if (!IsValidStatusTransition(ticket.Status, request.Status))
            throw new ConflictException($"Cannot change ticket status from {ticket.Status} to {request.Status}.");


        var history = new TicketHistory
        {
            ActorUserId = caller.Id,
            OldStatus = ticket.Status,
            NewStatus = request.Status,
            TicketId = ticket.Id,
            CreatedAt = DateTime.UtcNow
        };

        ticket.Status = request.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateStatusWithHistoryAsync(ticket, history);

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
            AssignedAgentEmail = ticket.AssignedAgent?.Email
        };

        return new ServiceResult<TicketResponseDto?>(ticketResponseDto);
    }

    public async Task<ServiceResult<List<TicketHistoryResponseDto>>> GetHistoryByTicketIdAsync(int ticketId, CurrentUser caller, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId, cancellationToken);

        if (ticket is null || !CanReadTicket(ticket, caller))
            throw new NotFoundException($"Ticket not found with this id: {ticketId}");

        var histories = await _ticketRepository.GetHistoryByTicketIdAsync(ticketId, cancellationToken);

        var response = histories.Select((history) => new TicketHistoryResponseDto
        {
            Id = history.Id,
            TicketId = history.TicketId,
            NewStatus = history.NewStatus,
            OldStatus = history.OldStatus,
            ActorUserId = history.ActorUserId,
            ActorEmail = history.ActorUser.Email ?? string.Empty,
            CreatedAt = history.CreatedAt
        }).ToList();

        return new ServiceResult<List<TicketHistoryResponseDto>>(response);
    }
}
