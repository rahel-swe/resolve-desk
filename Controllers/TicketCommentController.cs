using Microsoft.AspNetCore.Mvc;
using SupportPilotAI.Dtos;
using SupportPilotAI.Models;
using SupportPilotAI.Services;

namespace SupportPilotAI.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketCommentController(ITicketCommentService ticketCommentService) : ControllerBase
{
    private readonly ITicketCommentService _ticketCommentService = ticketCommentService;


    [HttpPost("{id}/comments")]
    public async Task<ActionResult> CreateTicketComment(int id, CreateTicketCommentDto request)
    {
        await _ticketCommentService.AddTicketCommentAsync(id, request);

        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketComment>>> GetTicketCommentsById(int id)
    {
        var result = await _ticketCommentService.GetTicketCommentsAsync(id);

        return Ok(result);
    }


}
