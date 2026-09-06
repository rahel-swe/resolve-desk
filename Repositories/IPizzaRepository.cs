using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IPizzaRepository
{
    Task<(List<Pizza> Items, int TotalCount)> GetAll(string? search, int page, int pageSize);

    Task<Pizza?> Get(int id);

    Task<Pizza?> GetByName(string name, int? excludeId = null);

    Task Create(Pizza pizza);

    Task Update(Pizza pizza);

    Task Delete(Pizza pizza);
}