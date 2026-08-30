

using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;

[ApiController]
[Route("[controller]")]
public class OrderController : ControllerBase
{

    private static OrderResponseDto ToResponseDto(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            CustomerName = order.CustomerName,
            TotalPrice = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(item => new OrderItemResponseDto
            {
                Id = item.Id,
                PizzaId = item.PizzaId,
                PizzaName = item.Pizza.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.UnitPrice * item.Quantity
            }).ToList()
        };
    }

    private readonly IOrderService _orderService;


    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }



    [HttpGet]
    public async Task<ActionResult<List<OrderResponseDto>>> GetAll()
    {
        var orders = await _orderService.GetAll();

        return orders.Select(ToResponseDto).ToList();
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> Get(int id)
    {
        var order = await _orderService.Get(id);

        if (order is null)
            return NotFound();

        return ToResponseDto(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto request)
    {
        var result = await _orderService.Create(request);

        if (!result.IsSuccess || result.Data is null)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(Get), new { id = result.Data.Id }, ToResponseDto(result.Data));
    }
}