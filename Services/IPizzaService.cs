using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;


public interface IPizzaService
{
    Task<PageResultDto<Pizza>> GetAll(string? search, int page, int pageSize);

    Task<Pizza?> Get(int id);

    Task Add(Pizza pizza);

    Task Delete(int id);

    Task Update(Pizza pizza);
}