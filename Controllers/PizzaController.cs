

using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;

[Authorize(Policy = "PizzaAccess")]
[ApiController]
[Route("api/pizzas")]
public class PizzaController(IPizzaService pizzaService) : ControllerBase
{

    private readonly IPizzaService _pizzaService = pizzaService;

    private static PizzaResponseDto ToResponse(Pizza pizza)
    {
        return new PizzaResponseDto
        {
            Id = pizza.Id,
            Name = pizza.Name ?? string.Empty,
            IsGlutenFree = pizza.IsGlutenFree,
            Price = pizza.Price
        };
    }

    [HttpGet]
    public async Task<ActionResult<PageResultDto<PizzaResponseDto>>> GetAll(string? search, int page = 1, int pageSize = 10)
    {

        var result = await _pizzaService.GetAll(search, page, pageSize);

        return new PageResultDto<PizzaResponseDto>
        {
            Items = result.Items.Select(ToResponse).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PizzaResponseDto>> Get(int id)
    {
        var pizza = await _pizzaService.Get(id);

        return ToResponse(pizza);
    }

    [HttpPost]
    public async Task<ActionResult<PizzaResponseDto>> Create(CreatePizzaDto request)
    {

        var pizza = await _pizzaService.Create(request);

        return CreatedAtAction(
            nameof(Get),
            new { id = pizza.Id },
            ToResponse(pizza));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePizzaDto request)
    {
        await _pizzaService.Update(id, request);

        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _pizzaService.Delete(id);

        return NoContent();
    }

}