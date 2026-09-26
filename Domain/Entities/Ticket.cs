
using ResolveDesk.Enums;

namespace ResolveDesk.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public TicketStatus Status { get; set; } = TicketStatus.Open;


    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? AssignedAgentId { get; set; }
    public User? AssignedAgent { get; set; }

    public ICollection<TicketComment> Comments { get; set; } =
    new List<TicketComment>();
}
