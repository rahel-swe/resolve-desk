using SupportPilotAI.Common;
using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Repositories;

namespace SupportPilotAI.Services;

public class KnowledgeArticleService(IKnowledgeArticleRepository knowledgeArticleRepository) : IKnowledgeArticleService
{
    private readonly IKnowledgeArticleRepository _knowledgeArticleRepository = knowledgeArticleRepository;

    public async Task<ServiceResult<KnowledgeArticleResponseDto>> CreateArticleAsync(CreateKnowledgeArticleDto request, int userId)
    {
        var article = new KnowledgeArticle
        {
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            Category = request.Category.Trim(),
            Tags = request.Tags
                .Where(tag => !string.IsNullOrWhiteSpace(tag))
                .Select(tag => tag.Trim())
                .Distinct()
                .ToList(),
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdArticle = await _knowledgeArticleRepository.CreateAsync(article);

        return new ServiceResult<KnowledgeArticleResponseDto>(MapToResponse(createdArticle));
    }

    public async Task<ServiceResult<List<KnowledgeArticleResponseDto>>> GetAllArticlesAsync()
    {
        var articles = await _knowledgeArticleRepository.GetAllAsync();

        return new ServiceResult<List<KnowledgeArticleResponseDto>>(articles.Select(MapToResponse).ToList());
    }

    public async Task<ServiceResult<List<KnowledgeArticleResponseDto>>> SearchArticlesAsync(string? keywords, string? category)
    {
        var articles = await _knowledgeArticleRepository.SearchByCategoryOrKeyword(keywords, category);

        return new ServiceResult<List<KnowledgeArticleResponseDto>>(articles.Select(MapToResponse).ToList());
    }

    public async Task<ServiceResult<KnowledgeArticleResponseDto?>> GetArticleByIdAsync(int id)
    {
        var article = await _knowledgeArticleRepository.GetByIdAsync(id);

        if (article is null)
            throw new NotFoundException($"Article not found with this id: {id}");

        return new ServiceResult<KnowledgeArticleResponseDto?>(MapToResponse(article));
    }

    public async Task<ServiceResult<KnowledgeArticleResponseDto?>> UpdateArticleAsync(int id, UpdateKnowledgeArticleDto request)
    {
        var article = await _knowledgeArticleRepository.GetByIdAsync(id);

        if (article is null)
            throw new NotFoundException($"Article not found with this id: {id}");

        article.Title = request.Title.Trim();
        article.Content = request.Content.Trim();
        article.Category = request.Category.Trim();
        article.Tags = request.Tags
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Select(tag => tag.Trim())
            .Distinct()
            .ToList();

        article.UpdatedAt = DateTime.UtcNow;

        await _knowledgeArticleRepository.UpdateAsync(article);

        return new ServiceResult<KnowledgeArticleResponseDto?>(MapToResponse(article));
    }

    private static KnowledgeArticleResponseDto MapToResponse(KnowledgeArticle article)
    {
        return new KnowledgeArticleResponseDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            Category = article.Category,
            Tags = article.Tags,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt,
            CreatedByUserId = article.CreatedByUserId,
            CreatedByEmail = article.User?.Email ?? string.Empty
        };
    }
}
