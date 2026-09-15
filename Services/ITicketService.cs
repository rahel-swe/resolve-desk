using ResolveDesk.Common;
using ResolveDesk.Dtos;

namespace ResolveDesk.Services;

public interface ITicketService
{
    Task<ServiceResult<TicketResponseDto>> CreateTicketAsync(CreateTicketDto request, int userId);
    Task<ServiceResult<List<TicketResponseDto>>> GetAllTicketsAsync(CurrentUser caller);
    Task<ServiceResult<List<TicketResponseDto>>> GetUserTicketsAsync(int userId, CurrentUser caller);
    Task<ServiceResult<TicketResponseDto?>> GetTicketByIdAsync(int id, CurrentUser caller);
    Task<ServiceResult<TicketResponseDto?>> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request, CurrentUser caller);
}
