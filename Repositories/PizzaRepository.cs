using ContosoPizza.Data;
using ContosoPizza.Models;
using Microsoft.EntityFrameworkCore;

namespace ContosoPizza.Repositories;

public class PizzaRepository : IPizzaRepository
{
    private readonly AppDbContext _db;

    public PizzaRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(List<Pizza> Items, int TotalCount)> GetAll(string? search, int page, int pageSize)
    {

        var query = _db.Pizzas.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(pizza => pizza.Name != null && pizza.Name.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var items = await query.OrderBy(Pizza => Pizza.Id).
        Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();



        return (items, totalCount);
    }

    public async Task<Pizza?> Get(int id)
    {
        return await _db.Pizzas.FindAsync(id);
    }

    public async Task Add(Pizza pizza)
    {
        _db.Pizzas.Add(pizza);
        await _db.SaveChangesAsync();
    }

    public async Task Update(Pizza pizza)
    {
        _db.Pizzas.Update(pizza);
        await _db.SaveChangesAsync();
    }

    public async Task Delete(Pizza pizza)
    {
        _db.Pizzas.Remove(pizza);
        await _db.SaveChangesAsync();
    }


}