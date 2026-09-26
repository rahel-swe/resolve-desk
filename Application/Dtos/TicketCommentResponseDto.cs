namespace ResolveDesk.Dtos;

public class TicketCommentResponseDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
}
