using ResolveDesk.Common;
using ResolveDesk.Dtos;

namespace ResolveDesk.Services;

public interface IKnowledgeArticleService
{
    Task<ServiceResult<KnowledgeArticleResponseDto>> CreateArticleAsync(CreateKnowledgeArticleDto request, int userId);
    Task<ServiceResult<List<KnowledgeArticleResponseDto>>> GetAllArticlesAsync();
    Task<ServiceResult<List<KnowledgeArticleResponseDto>>> SearchArticlesAsync(string? keywords, string? category);
    Task<ServiceResult<KnowledgeArticleResponseDto?>> GetArticleByIdAsync(int id);
    Task<ServiceResult<KnowledgeArticleResponseDto?>> UpdateArticleAsync(int id, UpdateKnowledgeArticleDto request);
}
