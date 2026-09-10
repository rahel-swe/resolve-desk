using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Repositories;
using SupportPilotAI.Enums;
using SupportPilotAI.Common;

namespace SupportPilotAI.Services;

public class TicketService(ITicketRepository ticketRepository) : ITicketService
{

    private readonly ITicketRepository _ticketRepository = ticketRepository;

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

    public async Task<ServiceResult<List<TicketResponseDto>>> GetAllTicketsAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();

        var ticketResponse = tickets.Select(ticket => new TicketResponseDto
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

        return new ServiceResult<List<TicketResponseDto>>(ticketResponse);
    }

    public async Task<ServiceResult<TicketResponseDto?>> GetTicketByIdAsync(int id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket is null)
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

    public async Task<ServiceResult<List<TicketResponseDto>>> GetUserTicketsAsync(int userId)
    {
        var tickets = await _ticketRepository.GetByUserIdAsync(userId);

        var ticketResponseDto = tickets.Select(ticket => new TicketResponseDto
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

        return new ServiceResult<List<TicketResponseDto>>(ticketResponseDto);
    }

    public async Task<ServiceResult<TicketResponseDto?>> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket is null)
            throw new NotFoundException($"Ticket not found with this id: {id}");

        ticket.Status = request.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);

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
}
