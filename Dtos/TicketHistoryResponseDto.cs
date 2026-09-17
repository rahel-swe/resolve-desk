using ResolveDesk.Enums;

namespace ResolveDesk.Dtos;

public class TicketHistoryResponseDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int ActorUserId { get; set; }
    public string ActorEmail { get; set; } = string.Empty;
    public TicketStatus OldStatus { get; set; }
    public TicketStatus NewStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}