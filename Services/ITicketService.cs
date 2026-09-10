using SupportPilotAI.Common;
using SupportPilotAI.Dtos;
using SupportPilotAI.Models;

namespace SupportPilotAI.Services;

public interface ITicketService
{
    Task<ServiceResult<TicketResponseDto>> CreateTicketAsync(CreateTicketDto request, int userId);
    Task<ServiceResult<List<TicketResponseDto>>> GetAllTicketsAsync();
    Task<ServiceResult<List<TicketResponseDto>>> GetUserTicketsAsync(int userId);
    Task<ServiceResult<TicketResponseDto?>> GetTicketByIdAsync(int id);
    Task<ServiceResult<TicketResponseDto?>> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request);
}