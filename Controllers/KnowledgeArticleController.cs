using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Dtos;
using ResolveDesk.Services;

namespace ResolveDesk.Controllers;

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

        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> GetArticleById(int id)
    {
        var result = await _knowledgeArticleService.GetArticleByIdAsync(id);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> CreateArticle(CreateKnowledgeArticleDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
            return Unauthorized();

        var result = await _knowledgeArticleService.CreateArticleAsync(request, int.Parse(userId));

        return Ok(result.Data);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<KnowledgeArticleResponseDto>> UpdateArticle(int id, UpdateKnowledgeArticleDto request)
    {
        var result = await _knowledgeArticleService.UpdateArticleAsync(id, request);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }
}
