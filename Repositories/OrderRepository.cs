using ContosoPizza.Data;
using ContosoPizza.Models;
using Microsoft.EntityFrameworkCore;

namespace ContosoPizza.Repositories;

public class OrderRepository : IOrderRepository
{

    private readonly AppDbContext _db;
    public OrderRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Order>> GetAll()
    {
        return await _db.Orders.Include(order => order.Items).ThenInclude(item => item.Pizza).ToListAsync();
    }

    public async Task<Order?> Get(int id)
    {
        return await _db.Orders.Include(order => order.Items)
                               .ThenInclude(item => item.Pizza)
                               .FirstOrDefaultAsync(order => order.Id == id);
    }

    public async Task Add(Order order)
    {
        _db.Orders.Add(order);

        await _db.SaveChangesAsync();
    }


}