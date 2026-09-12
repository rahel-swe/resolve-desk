using System.ComponentModel.DataAnnotations;

namespace SupportPilotAI.Dtos;

public class UpdateKnowledgeArticleDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title = string.Empty;

    [Required]
    [StringLength(10000, MinimumLength = 10)]
    public string Content = string.Empty;

    [Required]
    [StringLength(30, MinimumLength = 2)]
    public string Category = string.Empty;

    public DateTime UpdatedAt = DateTime.UtcNow;

    public List<string> Tags = [];

}
