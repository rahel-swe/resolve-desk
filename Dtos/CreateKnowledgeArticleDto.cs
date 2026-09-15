using System.ComponentModel.DataAnnotations;

namespace ResolveDesk.Dtos;

public class CreateKnowledgeArticleDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(10000, MinimumLength = 10)]
    public string Content { get; set; } = string.Empty;

    [Required]
    [StringLength(30, MinimumLength = 2)]
    public string Category { get; set; } = string.Empty;

    public List<string> Tags { get; set; } = [];
}
