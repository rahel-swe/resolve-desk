namespace ResolveDesk.Dtos;

public class TicketCategorizationDto
{
    public string Department { get; set; } = string.Empty;
    public string IssueType { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
}
