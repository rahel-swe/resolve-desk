using SupportPilotAI.Dtos;
using SupportPilotAI.Models;

namespace SupportPilotAI.Services;

public interface ITicketService
{
    Task<TicketResponseDto> CreateTicketAsync(CreateTicketDto request, int userId);
    Task<List<TicketResponseDto>> GetAllTicketsAsync();
    Task<List<TicketResponseDto>> GetUserTicketsAsync(int userId);
    Task<TicketResponseDto?> GetTicketByIdAsync(int id);
    Task<TicketResponseDto?> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request);
}