using ContosoPizza.Common;
using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Repositories;

namespace ContosoPizza.Services;

public class PizzaService(IPizzaRepository pizzaRepository) : IPizzaService
{
    private readonly IPizzaRepository _pizzaRepository = pizzaRepository;

    private async Task ValidateUniqueNameAsync(string name, int? excludeId = null)
    {
        var normalizedName = name.Trim();

        var existingPizza = await _pizzaRepository.GetByName(name, excludeId);

        if (existingPizza is not null)
            throw new ConflictException($"A pizza named '{normalizedName}' already exists.");
    }

    public async Task<PageResultDto<Pizza>> GetAll(string? search, int page, int pageSize)
    {

        if (page < 1) page = 1;

        if (pageSize < 1) pageSize = 1;

        if (pageSize > 50) pageSize = 50;

        var (Items, TotalCount) = await _pizzaRepository.GetAll(search, page, pageSize);

        return new PageResultDto<Pizza>
        {
            Items = Items,
            Page = page,
            PageSize = pageSize,
            TotalCount = TotalCount,
            TotalPages = (int)Math.Ceiling(TotalCount / (double)pageSize)
        };

    }

    public async Task<Pizza> Get(int id)
    {
        var pizza = await _pizzaRepository.Get(id);
        if (pizza is null)
            throw new NotFoundException($"Pizza with id {id} was not found.");


        return pizza;
    }

    public async Task<Pizza> Create(CreatePizzaDto request)
    {


        var pizza = new Pizza
        {
            Name = request.Name.Trim(),
            IsGlutenFree = request.IsGlutenFree,
            Price = request.Price
        };

        await ValidateUniqueNameAsync(pizza.Name);

        await _pizzaRepository.Create(pizza);

        return pizza;
    }

    public async Task Update(int id, UpdatePizzaDto request)
    {
        var pizza = await _pizzaRepository.Get(id);

        if (pizza is null)
            throw new NotFoundException($"Pizza with id {id} was not found.");

        var normalizedName = request.Name.Trim();

        await ValidateUniqueNameAsync(normalizedName, id);

        pizza.Name = normalizedName;
        pizza.IsGlutenFree = request.IsGlutenFree;
        pizza.Price = request.Price;

        await _pizzaRepository.Update(pizza);
    }

    public async Task Delete(int id)
    {
        var pizza = await _pizzaRepository.Get(id);

        if (pizza is null) throw new NotFoundException($"Pizza with id {id} was not found.");

        await _pizzaRepository.Delete(pizza);
    }

}