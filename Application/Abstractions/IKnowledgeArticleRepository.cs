using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Infrastructure.Repositories;

public interface IKnowledgeArticleRepository
{
    Task<KnowledgeArticle> CreateAsync(KnowledgeArticle article);

    Task<KnowledgeArticle?> GetByIdAsync(int id);

    Task<List<KnowledgeArticle>> GetAllAsync();

    Task<List<KnowledgeArticle>> SearchByCategoryOrKeyword(string? keywords, string? category);

    Task UpdateAsync(KnowledgeArticle article);
}
