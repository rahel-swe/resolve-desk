using ContosoPizza.Models;
using ContosoPizza.Repositories;

namespace ContosoPizza.Services;

public class OrderService(IOrderRepository orderRepository) : IOrderService
{

    private readonly IOrderRepository _orderRepository = orderRepository;

    public async Task<List<Order>> GetAll() => await _orderRepository.GetAll();


    public async Task<Order?> Get(int id) => await _orderRepository.Get(id);


    public async Task Add(Order order)
    {

        order.CreatedAt = DateTime.UtcNow;

        await _orderRepository.Add(order);
    }
}