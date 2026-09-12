using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public interface IKnowledgeArticleRepository
{
    Task CreateArticle(KnowledgeArticle article);

    Task<KnowledgeArticle> GetArticleById(int id);

    Task<List<KnowledgeArticle>> GetAllArticles();

    Task<List<KnowledgeArticle>> SearchByCategoryOrKeyword(string keywords, string category);

    Task UpdateArticle(KnowledgeArticle article);
}
