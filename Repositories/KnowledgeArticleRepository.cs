using Microsoft.EntityFrameworkCore;
using SupportPilotAI.Common;
using SupportPilotAI.Data;
using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public class KnowledgeArticleRepository(AppDbContext db) : IKnowledgeArticleRepository
{
    private readonly AppDbContext _db = db;

    public async Task<KnowledgeArticle> CreateAsync(KnowledgeArticle article)
    {
        _db.KnowledgeArticles.Add(article);
        await _db.SaveChangesAsync();

        return article;
    }

    public async Task<KnowledgeArticle?> GetByIdAsync(int id)
    {
        return await _db.KnowledgeArticles
            .Include(article => article.User)
            .FirstOrDefaultAsync(article => article.Id == id);
    }

    public async Task<List<KnowledgeArticle>> GetAllAsync()
    {
        return await _db.KnowledgeArticles
            .Include(article => article.User)
            .OrderByDescending(article => article.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<KnowledgeArticle>> SearchByCategoryOrKeyword(string? keywords, string? category)
    {
        var articlesQueryable = _db.KnowledgeArticles
            .Include(article => article.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCategory = category.Trim();
            articlesQueryable = articlesQueryable.Where(article =>
                article.Category.ToLower().Contains(normalizedCategory.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(keywords))
        {
            var normalizedKeywords = keywords.Trim();
            var loweredKeywords = normalizedKeywords.ToLower();

            articlesQueryable = articlesQueryable.Where(article =>
                article.Title.ToLower().Contains(loweredKeywords)
                || article.Content.ToLower().Contains(loweredKeywords)
                || article.Category.ToLower().Contains(loweredKeywords));
        }

        return await articlesQueryable
            .OrderByDescending(article => article.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(KnowledgeArticle article)
    {
        _db.KnowledgeArticles.Update(article);
        await _db.SaveChangesAsync();
    }
}
