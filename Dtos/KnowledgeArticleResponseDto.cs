using System.ComponentModel.DataAnnotations;
using SupportPilotAI.Models;

namespace SupportPilotAI.Dtos;

public class KnowledgeArticleResponseDto
{

    public string Title = string.Empty;


    public string Content = string.Empty;


    public string Category = string.Empty;

    public List<string> Tags = [];
    public DateTime CreatedAt;
    public DateTime UpdatedAt;
    public User User;
    public int CreatedByUserId;
}
