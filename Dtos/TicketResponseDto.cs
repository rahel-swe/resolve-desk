using SupportPilotAI.Enums;

namespace SupportPilotAI.Dtos;

public class TicketResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByEmail { get; set; } = string.Empty;
    public string? AssignedAgentEmail { get; set; }
}
