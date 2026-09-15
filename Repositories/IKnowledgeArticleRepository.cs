using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public interface IKnowledgeArticleRepository
{
    Task<KnowledgeArticle> CreateAsync(KnowledgeArticle article);

    Task<KnowledgeArticle?> GetByIdAsync(int id);

    Task<List<KnowledgeArticle>> GetAllAsync();

    Task<List<KnowledgeArticle>> SearchByCategoryOrKeyword(string? keywords, string? category);

    Task UpdateAsync(KnowledgeArticle article);
}
