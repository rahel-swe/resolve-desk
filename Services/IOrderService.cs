
using ContosoPizza.Common;
using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;

public interface IOrderService
{
    Task<List<Order>> GetAll();

    Task<Order?> Get(int id);

    Task Add(Order order);

    Task<ServiceResult<Order>> Create(CreateOrderDto request);
}