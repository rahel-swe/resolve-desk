namespace SupportPilotAI.Models;

public class KnowledgeArticle
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string> Tags = [];
    public int CreatedByUserId;
    public User User = null!;
    public DateTime CreatedAt;
    public DateTime UpdatedAt;
}
