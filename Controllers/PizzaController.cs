using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;


[ApiController]
[Route("[controller]")]
public class PizzaController(IPizzaService pizzaService) : ControllerBase
{

    private readonly IPizzaService _pizzaService = pizzaService;

    [HttpGet]
    public async Task<ActionResult<PageResultDto<Pizza>>> GetAll(string? search, int page = 1, int pageSize = 10) => await _pizzaService.GetAll(search, page, pageSize);

    [HttpGet("{id}")]
    public async Task<ActionResult<Pizza>> Get(int id)
    {
        var pizza = await _pizzaService.Get(id);

        if (pizza is null) return NotFound();

        return pizza;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Pizza pizza)


    {

        if (string.IsNullOrWhiteSpace(pizza.Name))
            return BadRequest("Pizza name is required.");


        if (pizza.Price <= 0)
            return BadRequest("Price must greater then 0");


        await _pizzaService.Add(pizza);

        return CreatedAtAction(nameof(Get), new { id = pizza.Id }, pizza);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Pizza pizza)
    {
        if (id != pizza.Id) return BadRequest();

        var existing = await _pizzaService.Get(id);

        if (existing is null) return NotFound();

        if (string.IsNullOrWhiteSpace(pizza.Name))
            return BadRequest("Pizza name is required.");

        if (pizza.Price <= 0)
            return BadRequest("Price must greater then 0");

        await _pizzaService.Update(pizza);
        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pizza = await _pizzaService.Get(id);

        if (pizza is null) return NotFound();

        await _pizzaService.Delete(id);

        return NoContent();
    }

}