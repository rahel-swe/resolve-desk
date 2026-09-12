using System.ComponentModel.DataAnnotations;
using SupportPilotAI.Models;

namespace SupportPilotAI.Dtos;

public class CreateKnowledgeArticleDto
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

    public List<string> Tags = [];
    public DateTime CreatedAt = DateTime.UtcNow;
    public DateTime UpdatedAt = DateTime.UtcNow;
    public int CreatedByUserId;
}
