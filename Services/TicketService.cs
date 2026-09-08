using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Repositories;
using SupportPilotAI.Enums;

namespace SupportPilotAI.Services;

public class TicketService(ITicketRepository ticketRepository, IUserRepository userRepository) : ITicketService
{

    private readonly ITicketRepository _ticketRepository = ticketRepository;
    private readonly IUserRepository _userRepository = userRepository;

    public async Task<TicketResponseDto> CreateTicketAsync(CreateTicketDto request, int userId)
    {
        var ticket = new Ticket
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId,
        };

        var createdTicket = await _ticketRepository.CreateAsync(ticket);

        return new TicketResponseDto
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
    }

    public async Task<List<TicketResponseDto>> GetAllTicketsAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();

        return tickets.Select(ticket => new TicketResponseDto
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
    }

    public async Task<TicketResponseDto?> GetTicketByIdAsync(int id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket is null) return null;

        return new TicketResponseDto
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

    }

    public async Task<List<TicketResponseDto>> GetUserTicketsAsync(int userId)
    {
        var tickets = await _ticketRepository.GetByUserIdAsync(userId);

        return tickets.Select(ticket => new TicketResponseDto
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
    }

    public async Task<TicketResponseDto?> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket is null)
            return null;

        ticket.Status = request.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);

        return new TicketResponseDto
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
    }
}
