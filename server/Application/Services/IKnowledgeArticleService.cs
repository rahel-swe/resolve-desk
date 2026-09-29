using ResolveDesk.Api.Common;
using ResolveDesk.Application.Common;
using ResolveDesk.Application.Dtos;

namespace ResolveDesk.Application.Services;

public interface IKnowledgeArticleService
{
    Task<ServiceResult<KnowledgeArticleResponseDto>> CreateArticleAsync(CreateKnowledgeArticleDto request, CurrentUser caller);
    Task<ServiceResult<List<KnowledgeArticleResponseDto>>> GetAllArticlesAsync();
    Task<ServiceResult<List<KnowledgeArticleResponseDto>>> SearchArticlesAsync(string? keywords, string? category);
    Task<ServiceResult<KnowledgeArticleResponseDto?>> GetArticleByIdAsync(int id);
    Task<ServiceResult<KnowledgeArticleResponseDto?>> UpdateArticleAsync(int id, UpdateKnowledgeArticleDto request);
}
