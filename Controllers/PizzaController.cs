

using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;


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

        if (pizza is null)
            return Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Pizza not found",
            detail: $"Pizza with id {id} was not found.");

        return ToResponse(pizza);
    }

    [HttpPost]
    public async Task<ActionResult<PizzaResponseDto>> Create(CreatePizzaDto request)
    {
        var pizza = new Pizza
        {
            Name = request.Name.Trim() ?? string.Empty,
            IsGlutenFree = request.IsGlutenFree,
            Price = request.Price
        };


        await _pizzaService.Add(pizza);

        return CreatedAtAction(nameof(Get), new { id = pizza.Id }, ToResponse(pizza));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePizzaDto request)
    {
        var existing = await _pizzaService.Get(id);
        if (existing is null)
            return Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Pizza not found",
            detail: $"Pizza with id {id} was not found.");

        existing.Name = request.Name.Trim();
        existing.IsGlutenFree = request.IsGlutenFree;
        existing.Price = request.Price;

        await _pizzaService.Update(existing);

        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pizza = await _pizzaService.Get(id);

        if (pizza is null)
            return Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "Pizza not found",
        detail: $"Pizza with id {id} was not found.");

        await _pizzaService.Delete(id);

        return NoContent();
    }

}