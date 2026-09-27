using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Application.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Application.Services;

namespace ResolveDesk.Api.Controllers;

[Authorize(Policy = "AdminOrUser")]
[ApiController]
[Route("api/knowledge")]
public class KnowledgeArticleController(IKnowledgeArticleService knowledgeArticleService) : ControllerBase
{
    private readonly IKnowledgeArticleService _knowledgeArticleService = knowledgeArticleService;

    [HttpGet]
    public async Task<ActionResult<List<KnowledgeArticleResponseDto>>> GetAllArticles([FromQuery] string? keywords, [FromQuery] string? category)
    {
        var result = string.IsNullOrWhiteSpace(keywords) && string.IsNullOrWhiteSpace(category)
            ? await _knowledgeArticleService.GetAllArticlesAsync()
            : await _knowledgeArticleService.SearchArticlesAsync(keywords, category);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> GetArticleById(int id)
    {
        var result = await _knowledgeArticleService.GetArticleByIdAsync(id);

        if (result.Data is null)
            return NotFound();

        return Ok(result);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> CreateArticle(CreateKnowledgeArticleDto request)
    {

        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _knowledgeArticleService.CreateArticleAsync(request, caller);

        return Ok(result);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> UpdateArticle(int id, UpdateKnowledgeArticleDto request)
    {
        var result = await _knowledgeArticleService.UpdateArticleAsync(id, request);

        if (result.Data is null)
            return NotFound();

        return Ok(result);
    }
}
